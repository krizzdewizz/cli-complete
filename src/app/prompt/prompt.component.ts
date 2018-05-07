import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { PromptService } from '@services/prompt.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'clic-prompt',
  templateUrl: './prompt.component.html',
  styleUrls: ['./prompt.component.scss']
})
export class PromptComponent implements OnInit, OnDestroy {

  info: string;
  @Input() prompt: string;

  private subscriptions: Subscription[] = [];

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
}
