import { Component, OnInit, ViewChild, OnDestroy, Output, EventEmitter } from '@angular/core';
import { SessionService } from '@services/session.service';
import { TerminalComponent } from '../terminal/terminal.component';

@Component({
  selector: 'clic-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss']
})
export class EditorComponent implements OnInit, OnDestroy {

  private toDispose: monaco.IDisposable[];

  @ViewChild('editor') editorCmp;
  @ViewChild(TerminalComponent) terminalCmp: TerminalComponent;

  editorOptions: monaco.editor.IEditorConstructionOptions = {
    theme: 'vs-dark',
    lineNumbers: 'off',
    letterSpacing: 1,
    // language: 'javascript',
    // automaticLayout: true
  };
  code = '';
  // code = String(new Date(Date.now()) + '\n\n');

  constructor(private sessionService: SessionService) {
  }

  private get editor(): monaco.editor.IStandaloneCodeEditor {
    return this.editorCmp._editor;
  }

  ngOnInit() {
    const initEditor = () => {

      this.editor.focus();

      this.toDispose = [
        this.editor.addAction({
          id: 'send',
          label: 'send',
          keybindings: [monaco.KeyCode.Enter],
          run: editor => {
            this.terminalCmp.send(this.code);
          }
        })
      ];
    };

    setTimeout(initEditor, 1000);
  }

  ngOnDestroy(): void {
    this.toDispose.forEach(it => it.dispose());
  }
}
