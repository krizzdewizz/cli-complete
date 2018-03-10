import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';

import {
  CommandRegistry
} from '@phosphor/commands';

import {
  Message
} from '@phosphor/messaging';

import {
  BoxPanel, CommandPalette, ContextMenu, DockPanel, Menu, MenuBar, Widget
} from '@phosphor/widgets';
import { ContentWidget } from './content-widget';
import { EditorComponent } from '../editor/editor.component';

@Component({
  selector: 'clic-frame',
  templateUrl: './frame.component.html',
  styleUrls: ['./frame.component.scss']
})
export class FrameComponent implements OnInit {

  @ViewChild(EditorComponent, { read: ElementRef }) editorElement: ElementRef;

  constructor(private elRef: ElementRef) {
  }

  ngOnInit() {
    this.createUi();
  }

  private createUi() {
    const r1 = new ContentWidget('Red', this.editorElement.nativeElement);

    const dock = new DockPanel();
    dock.addWidget(r1);
    dock.id = 'dock';

    BoxPanel.setStretch(dock, 1);

    const main = new BoxPanel({ direction: 'left-to-right', spacing: 0 });
    main.id = 'main';
    main.addWidget(dock);

    window.onresize = () => { main.update(); };

    Widget.attach(main, this.elRef.nativeElement);
  }

}
