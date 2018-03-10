import { Component, OnInit, ViewChild } from '@angular/core';
import { MonacoEditorModule } from 'ngx-monaco-editor';

@Component({
  selector: 'clic-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss']
})
export class EditorComponent implements OnInit {
  editorOptions: monaco.editor.IEditorConstructionOptions = {
    theme: 'vs-dark',
    language: 'javascript',
    automaticLayout: true
  };
  code = 'function x() {\nconsole.log("Hello world!");\n}';

  constructor() { }

  ngOnInit() {
  }

}
