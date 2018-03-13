import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'clic-prompt',
  templateUrl: './prompt.component.html',
  styleUrls: ['./prompt.component.scss']
})
export class PromptComponent implements OnInit {

  @Input() prompt: string;

  constructor() { }

  ngOnInit() {
  }
}
