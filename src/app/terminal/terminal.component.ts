import { Component, OnInit, ElementRef } from '@angular/core';
import { Terminal } from 'xterm';
import * as fit from 'xterm/lib/addons/fit/fit';

Terminal.applyAddon(fit);  // Apply the `fit` addon

@Component({
  selector: 'clic-terminal',
  templateUrl: './terminal.component.html',
  styleUrls: ['./terminal.component.scss']
})
export class TerminalComponent implements OnInit {

  private term: Terminal;

  constructor(private elRef: ElementRef) {
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

  send(data: string) {
    this.term.writeln(data);
  }
}
