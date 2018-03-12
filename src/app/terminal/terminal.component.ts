import { Component, OnInit, ElementRef, OnDestroy, HostBinding, HostListener, Output, EventEmitter } from '@angular/core';
import { Terminal } from 'xterm';
import * as fit from 'xterm/lib/addons/fit/fit';
import * as winptyCompat from 'xterm/lib/addons/winptyCompat/winptyCompat';
import { TerminalService } from '@services/xterm.service';
import { ISubscription } from 'rxjs/Subscription';
import { TerminalSession } from '@model/model';

const { remote, clipboard } = window.require('electron');

Terminal.applyAddon(fit);
Terminal.applyAddon(winptyCompat);

@Component({
  selector: 'clic-terminal',
  templateUrl: './terminal.component.html',
  styleUrls: ['./terminal.component.scss']
})
export class TerminalComponent implements OnInit, OnDestroy {

  private term: Terminal;
  private subscriptions: ISubscription[];
  private session: TerminalSession;

  @Output() focusNextGroup = new EventEmitter<void>();
  @Output() pasteFromClipboard = new EventEmitter<void>();

  constructor(private elRef: ElementRef, private termService: TerminalService) {
  }

  @HostListener('mouseup', ['$event'])
  onMouseUp(e: MouseEvent) {
    const term = this.term;
    if (e.button === 0 && term.hasSelection()) {
      clipboard.writeText(term.getSelection());
      term.clearSelection();
      return false;
    } else if (e.button === 2) {
      this.pasteFromClipboard.next();
      return false;
    }
  }

  ngOnInit() {
    const term = this.term = new Terminal({
      fontFamily: 'Consolas',
      fontSize: 14,
      letterSpacing: 1,
      theme: {
        background: '#1e1e1e',
        foreground: '#dddddd'
      }
    });

    (term as any).winptyCompatInit();

    // 'native' command line
    term.on('data', data => this.session.send(data));

    term.attachCustomKeyEventHandler(e => {
      if (e.key === 'F6') {
        this.focusNextGroup.next();
        return false;
      }
    });

    setTimeout(() => {
      term.open(this.elRef.nativeElement);
      // Ensure new processes' output starts at start of new line
      // this.term.write('\n\x1b[G');

      this.fit();
    });

    window.addEventListener('resize', () => this.fit());

    const session = this.session = this.termService.newSession({ shell: 'c:\\windows\\system32\\cmd.exe' });
    this.subscriptions = [
      session.onData.subscribe(data => this.onData(data))
    ];
    session.start();
  }

  private fit() {
    const term = this.term;
    (term as any).fit();
    this.session.resize(term.cols, term.rows);
  }

  ngOnDestroy() {
    this.subscriptions.forEach(it => it.unsubscribe());
  }

  private onData(data: string) {
    this.term.write(data);
    this.term.scrollToBottom();

    this.autoAnswerTerminateBatchJobMessage(data);
  }

  private autoAnswerTerminateBatchJobMessage(data: string) {
    const msg = 'Terminate batch job (Y/N)?';
    const pos = data.lastIndexOf('\n');
    const lastLine = pos >= 0 ? data.substring(pos).trim() : data;

    if (lastLine.includes(msg)) {
      this.send('y\r', false);
    }
  }

  send(data: string, clear = true) {
    this.session.send(data);
    if (clear) {
      this.term.clear();
    }
  }

  focus() {
    this.term.focus();
  }
}
