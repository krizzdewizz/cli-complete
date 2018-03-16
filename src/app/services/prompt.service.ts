import { Injectable, EventEmitter, NgZone } from '@angular/core';
import { CwdServer, ProcessInfo } from '@server/cwd-server';
import { Observable } from 'rxjs/Observable';
import { SessionInfo } from '@model/model';
import { accept } from '@util/util';

const { remote } = window.require('electron');
const { CwdServer: _CwdServer } = remote.require('./server/cwd-server');
const { processTree } = remote.require('./server/process-tree');
const path = remote.require('path');

async function findPid(rootPid: number) {
  const tree = await processTree(rootPid);
  let lastChild;
  accept(tree, node => lastChild = node);
  return lastChild.pid;
}

const CWD: CwdServer = _CwdServer.INSTANCE;

function formatTitle(title: string) {
  return path.basename(title);
}

@Injectable()
export class PromptService {
  info = new EventEmitter<string>();

  private infoTimer;

  showInfoForAWhile(msg: string) {
    clearTimeout(this.infoTimer);
    this.info.next(msg);
    this.infoTimer = setTimeout(() => this.info.next(''), 1000);
  }

  private prompts: { [pid: number]: EventEmitter<string> } = {};

  clearPrompt(sessionInfo: SessionInfo) {
    const p = this.prompts[sessionInfo.pid];
    if (p) {
      this.zone.run(() => p.next(''));
    }
  }

  getPrompt(sessionInfo: SessionInfo): Observable<string> {
    const pid = sessionInfo.pid;
    const p = this.prompts[pid];
    if (p) { return p; }

    const ee = new EventEmitter<string>();
    this.prompts[pid] = ee;

    const origUnsubscribe = ee.unsubscribe.bind(ee);
    ee.unsubscribe = () => {
      delete this.prompts[pid];
      origUnsubscribe();
    };

    return ee;
  }

  constructor(private zone: NgZone) {
  }

  async promptMayChanged(sessionInfo: SessionInfo) {
    if (!sessionInfo) {
      return;
    }

    const change = async (thePid: number) => {
      CWD.cwdMayChanged(thePid);
      const procInfo = await CWD.getCwd(thePid);
      this.emitPrompt(sessionInfo, procInfo);
    };

    const pid = await findPid(sessionInfo.pid);
    change(pid);

    setTimeout(async () => {
      const newPid = await findPid(sessionInfo.pid);
      if (newPid !== pid) {
        change(newPid);
      }
    }, 1000);
  }

  private formatPrompt(sessionInfo: SessionInfo, procInfo: ProcessInfo): string {
    // return `${procInfo.cwd} - ${formatTitle(procInfo.title)} - ${procInfo.commandLine}`;
    return [
      procInfo.cwd,
      formatTitle(procInfo.title)
    ]
      .filter(Boolean)
      .join(' - ');
  }

  private emitPrompt(sessionInfo: SessionInfo, procInfo: ProcessInfo) {
    const p = this.prompts[sessionInfo.pid];
    if (p) {
      const prompt = this.formatPrompt(sessionInfo, procInfo);
      this.zone.run(() => p.next(prompt));
    }
  }
}
