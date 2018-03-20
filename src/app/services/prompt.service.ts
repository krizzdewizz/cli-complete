import { Injectable, EventEmitter, NgZone } from '@angular/core';
import { ProcessInfo } from '@server/process-info';
import { Observable } from 'rxjs/Observable';
import { SessionInfo } from '@model/model';
import { accept } from '@util/util';

const { remote } = window.require('electron');
const { processInfoMayChanged, getProcessInfo } = remote.require('./process-info');
const { processTree } = remote.require('./process-tree');
const path = remote.require('path');

async function findPid(rootPid: number) {
  const tree = await processTree(rootPid);
  let lastChild;
  accept(tree, node => lastChild = node);
  return lastChild ? lastChild.pid : undefined;
}

function formatTitle(title: string) {
  return path.basename(title);
}

export interface Prompt {
  prompt: string;
  sessionInfo?: SessionInfo;
  procInfo?: ProcessInfo;
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

  private prompts: { [pid: number]: EventEmitter<Prompt> } = {};

  clearPrompt(sessionInfo: SessionInfo) {
    const p = this.prompts[sessionInfo.pid];
    if (p) {
      this.zone.run(() => p.next({ prompt: '' }));
    }
  }

  getPrompt(sessionInfo: SessionInfo): Observable<Prompt> {
    const pid = sessionInfo.pid;
    const p = this.prompts[pid];
    if (p) { return p; }

    const ee = new EventEmitter<Prompt>();
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
      processInfoMayChanged(thePid);
      const procInfo = await getProcessInfo(thePid);
      this.emitPrompt(sessionInfo, procInfo);
    };

    const pid = await findPid(sessionInfo.pid);
    if (pid) {
      change(pid);
      setTimeout(async () => {
        const newPid = await findPid(sessionInfo.pid);
        if (newPid && newPid !== pid) {
          change(newPid);
        }
      }, 1000);
    }
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
      this.zone.run(() => p.next({ prompt, sessionInfo, procInfo }));
    }
  }
}
