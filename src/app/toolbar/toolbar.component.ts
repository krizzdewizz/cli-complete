import { Component, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'clic-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss']
})
export class ToolbarComponent implements OnInit {

  @Output() newSession = new EventEmitter<void>();

  constructor() { }

  ngOnInit() {
  }
}
