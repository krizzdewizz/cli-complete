import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { appEvent } from '@services/app-event';
import { ISubscription } from 'rxjs/Subscription';
import { PromptService } from '@services/prompt.service';

const { remote } = window.require('electron');
const main = remote.require('./main');

@Component({
  selector: 'clic-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss']
})
export class ToolbarComponent implements OnInit, OnDestroy {

  @Input() title: boolean;

  info: string;
  private subscriptions: ISubscription[] = [];

  constructor(private promptService: PromptService) {
  }

  ngOnInit() {
    this.subscriptions = [
      this.promptService.info.subscribe(info => this.info = info)
    ];
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(it => it.unsubscribe());
  }

  onNewSession() {
    appEvent.newTerminal.next();
  }

  onSaveLayout() {
    appEvent.saveLayout.next();
  }

  onCloseWindow() {
    main.closeWindow();
  }
}
