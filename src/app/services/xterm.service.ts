import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { TermSession } from '@server/term-server';
import { Observable } from 'rxjs/Observable';

const { remote } = window.require('electron');

export abstract class TerminalService {
  onData: Observable<string>;
  abstract send(data: string);
  abstract start();
  resize(cols: number, rows: number) {
  }
}

const { TermSession: _TermSession } = remote.require('./server/term-server');

@Injectable()
export class RemoteService extends TerminalService {

  private termSession: TermSession;

  get onData(): Observable<string> {
    return this.termSession.dataChanged$;
  }

  constructor() {
    super();
    this.termSession = new _TermSession({ shell: 'c:\\windows\\system32\\cmd.exe' });
  }

  send(data: string) {
    this.termSession.send(data);
  }

  resize(cols: number, rows: number) {
    this.termSession.resize(cols, rows);
  }

  start() {
    this.termSession.start();
  }
}

@Injectable()
export class XtermService extends TerminalService {

  constructor() {
    super();
  }

  send(data: string) {
    // this.onData.next(`pingback ${data}\r\n`);
  }

  start() {
  }
}
