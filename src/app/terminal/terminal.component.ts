import { Component, OnInit, ElementRef, OnDestroy, HostBinding, HostListener } from '@angular/core';
import { Terminal } from 'xterm';
import * as fit from 'xterm/lib/addons/fit/fit';
import * as winptyCompat from 'xterm/lib/addons/winptyCompat/winptyCompat';
import { XtermService, TerminalService } from '@services/xterm.service';
import { ISubscription } from 'rxjs/Subscription';

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

  constructor(private elRef: ElementRef, private termService: TerminalService) {
  }

  @HostListener('mouseup')
  onMouseup() {
    const term = this.term;
    if (term.hasSelection()) {
      clipboard.writeText(term.getSelection());
      term.clearSelection();
      return false;
    }
  }

  ngOnInit() {

    this.termService.start();

    this.subscriptions = [
      this.termService.onData.subscribe(data => this.onData(data))
    ];

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

    setTimeout(() => {
      term.open(this.elRef.nativeElement);
      // Ensure new processes' output starts at start of new line
      // this.term.write('\n\x1b[G');

      this.fit();
    });

    window.addEventListener('resize', () => this.fit());
  }

  private fit() {
    const term = this.term;
    (term as any).fit();
    this.termService.resize(term.cols, term.rows);
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
    this.termService.send(data);
    if (clear) {
      this.term.clear();
    }
  }
}
