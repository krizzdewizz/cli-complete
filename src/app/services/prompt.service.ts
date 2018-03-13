import { Injectable, EventEmitter, NgZone } from '@angular/core';
import { CwdServer } from '@server/cwd-server';
import { Observable } from 'rxjs/Observable';
import { SessionInfo } from '@model/model';

const { remote } = window.require('electron');

const { CwdServer: _CwdServer } = remote.require('./server/cwd-server');

const CWD: CwdServer = _CwdServer.INSTANCE;

@Injectable()
export class PromptService {

  private prompts: { [pid: number]: EventEmitter<string> } = {};

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

  promptMayChanged(sessionInfo: SessionInfo) {
    if (!sessionInfo) {
      return;
    }
    const pid = sessionInfo.pid;

    CWD.cwdMayChanged(pid);
    setTimeout(() => {
      CWD.getCwd(pid, cwd => {
        this.emitPrompt(sessionInfo, cwd);
      });
    }, 800);
  }

  private formatPrompt(sessionInfo: SessionInfo, cwd: string): string {
    return `pid: ${sessionInfo.pid}, cwd: ${cwd}, t: ${Date.now()}`;
  }

  private emitPrompt(sessionInfo: SessionInfo, cwd: string) {
    const p = this.prompts[sessionInfo.pid];
    if (p) {
      const prompt = this.formatPrompt(sessionInfo, cwd);
      this.zone.run(() => p.next(prompt));
    }
  }
}
