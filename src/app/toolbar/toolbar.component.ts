import { Component, OnInit } from '@angular/core';
import { eventBus } from '@services/app-event';

@Component({
  selector: 'clic-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss']
})
export class ToolbarComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

  onNewSession() {
    eventBus.newTerminal.next();
  }
}
