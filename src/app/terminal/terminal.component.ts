import { Component, OnInit, ElementRef } from '@angular/core';

declare const Terminal;

@Component({
  selector: 'clic-terminal',
  templateUrl: './terminal.component.html',
  styleUrls: ['./terminal.component.scss']
})
export class TerminalComponent implements OnInit {

  constructor(private elRef: ElementRef) {
  }

  ngOnInit() {

    const term: xterm.Terminal = new Terminal();
    setTimeout(() => {
      term.open(this.elRef.nativeElement);
      term.write('Hello from $ ');
    })
  }

}
