import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { SessionService } from '@services/session.service';

@Component({
  selector: 'clic-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss']
})
export class EditorComponent implements OnInit, OnDestroy {

  editorOptions: monaco.editor.IEditorConstructionOptions = {
    theme: 'vs-dark',
    // language: 'javascript',
    automaticLayout: true
  };
  // code = '';
  code = String(new Date(Date.now()) + '\n\n');

  constructor(private sessionService: SessionService) {
  }

  ngOnInit() {
  }

  ngOnDestroy(): void {

  }
}
