import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';

export abstract class TerminalService {
  onData = new Subject<string>();
  abstract send(data: string);
}

@Injectable()
export class RemoteService extends TerminalService {

  constructor() {
    super();
  }

  send(data: string) {
    this.onData.next(`pingback ${data}\r\n`);
  }
}

@Injectable()
export class XtermService extends TerminalService {

  constructor() {
    super();
  }

  send(data: string) {
    this.onData.next(`pingback ${data}\r\n`);
  }
}
