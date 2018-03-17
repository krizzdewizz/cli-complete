import { Component, OnInit } from '@angular/core';
import { appEvent } from '@services/app-event';

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
    appEvent.newTerminal.next();
  }

  onSaveLayout() {
    appEvent.saveLayout.next();
  }
}
