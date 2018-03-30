import { Injectable, EventEmitter, NgZone } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { SessionInfo } from '@model/model';
import { accept } from '@util/util';
import { ProcessInfo } from '@server/process-info';
import { appEvent } from '@services/app-event';
import { EditorComponent } from '../editor/editor.component';

const { remote } = window.require('electron');
const { processInfoMayChanged, getProcessInfo } = remote.require('./process-info');
const { processTree } = remote.require('./process-tree');
const { loadPlugins, formatPrompt: formatPromptPlugin } = remote.require('./plugins');
const path = remote.require('path');

export interface FormatPromptParams {
  sessionInfo: SessionInfo;
  procInfo: ProcessInfo;
  procIsSelf: boolean;
  focus: boolean;
}

export interface Prompt {
  prompt: string;
  params?: FormatPromptParams;
}

async function findPid(rootPid: number) {
  const tree = await processTree(rootPid);
  let lastChild;
  accept(tree, node => {
    lastChild = node;
  });
  return lastChild ? lastChild.pid : undefined;
}

@Injectable()
export class PromptService {
  info = new EventEmitter<string>();

  private infoTimer;
  private focusedEditor: EditorComponent;

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
    loadPlugins();
    appEvent.focusEditor.subscribe(focusedEditor => this.focusedEditor = focusedEditor);
  }

  async promptMayChanged(sessionInfo: SessionInfo) {
    if (!sessionInfo) {
      return;
    }

    const change = async (thePid: number) => {
      processInfoMayChanged(thePid);
      const procInfo = await getProcessInfo(thePid);
      this.emitPrompt({
        sessionInfo,
        procInfo,
        procIsSelf: thePid === sessionInfo.pid,
        focus: this.focusedEditor && this.focusedEditor.sessionInfo.pid === sessionInfo.pid
      });
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

  private formatPromptDefault({ procInfo, procIsSelf }): string {
    return [
      procInfo.cwd,
      procIsSelf ? undefined : procInfo.title
    ]
      .filter(Boolean)
      .join(' - ');
  }

  private async formatPrompt(params: FormatPromptParams): Promise<string> {
    // return `${procInfo.cwd} - ${formatTitle(procInfo.title)} - ${procInfo.commandLine}`;
    const prompt = await formatPromptPlugin(params);
    return prompt || this.formatPromptDefault(params);
  }

  private async emitPrompt(params: FormatPromptParams) {
    const p = this.prompts[params.sessionInfo.pid];
    if (p) {
      const prompt = await this.formatPrompt(params);
      this.zone.run(() => p.next({ prompt, params }));
    }
  }
}
