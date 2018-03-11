import { Component, OnInit, ElementRef, OnDestroy } from '@angular/core';
import { Terminal } from 'xterm';
import * as fit from 'xterm/lib/addons/fit/fit';
import { XtermService, TerminalService } from '@services/xterm.service';
import { ISubscription } from 'rxjs/Subscription';

Terminal.applyAddon(fit);  // Apply the `fit` addon

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

  ngOnInit() {

    this.subscriptions = [
      this.termService.onData.subscribe(data => {
        this.term.write(data);
      })
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

    setTimeout(() => {
      term.open(this.elRef.nativeElement);

      // for (let i = 0; i < 2000; i++) {
      //   term.write('Hello from $ ' + i + '\n\r');
      // }

      (term as any).fit();
    });

    window.addEventListener('resize', () => {
      (term as any).fit();
    });
  }

  ngOnDestroy() {
    this.subscriptions.forEach(it => it.unsubscribe());
  }

  send(data: string) {
    this.termService.send(data);
  }
}
