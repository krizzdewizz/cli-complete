import { Injectable } from '@angular/core';
import { SessionConf, TerminalSession } from '@model/model';

const { remote } = window.require('electron');

export abstract class TerminalService {
  abstract newSession(conf: SessionConf): TerminalSession;
}

const { TermSession: _TermSession } = remote.require('./term-server');

@Injectable()
export class RemoteService extends TerminalService {
  newSession(conf: SessionConf): TerminalSession {
    return new _TermSession(conf);
  }
}
