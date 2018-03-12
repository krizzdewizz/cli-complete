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
  // code = '';
  // code = String(new Date(Date.now()) + '\n\n');
  code = `prompt !!READY!!
dir
cls
forever`;

  constructor(private sessionService: SessionService) {
  }

  private get editor(): monaco.editor.IStandaloneCodeEditor {
    return this.editorCmp._editor;
  }

  ngOnInit() {

    this.editorCmp.initMonaco(this.editorCmp.options);

    const initEditor = () => {

      const ed = this.editor;
      const line = ed.getSelection().startLineNumber;
      const maxCol = ed.getModel().getLineMaxColumn(line);
      ed.setSelection(new monaco.Range(line, maxCol, line, maxCol));

      ed.layout();
      ed.focus();

      this.toDispose = [
        ed.addAction({
          id: 'send',
          label: 'send',
          keybindings: [monaco.KeyCode.Enter],
          run: () => this.send()
        }),

        ed.addAction({
          id: 'break',
          label: 'break',
          // tslint:disable-next-line:no-bitwise
          keybindings: [monaco.KeyMod.chord(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_C, undefined)],
          run: () => this.break()
        }),

        ed.addAction({
          id: 'focus-terminal',
          label: 'Focus Terminal',
          keybindings: [monaco.KeyCode.F6],
          run: () => this.terminalCmp.focus()
        })
      ];
    };

    setTimeout(initEditor, 1000);
  }

  private break() {
    // console.log('breakkkkkkkkkkk');
    const ed = this.editor;
    if (ed.getSelection().isEmpty()) {
      this.terminalCmp.send(String.fromCharCode(3));
    } else {
      ed.getAction('editor.action.clipboardCopyAction').run();
    }
  }

  private send() {
    const ed = this.editor;
    const model = ed.getModel();
    const sel = ed.getSelection();
    const line = sel.startLineNumber;
    const maxCol = model.getLineMaxColumn(line);
    let text: string;
    const selEmpty = sel.isEmpty();
    if (selEmpty) {
      text = model.getLineContent(line);
    } else {
      text = model.getValueInRange(sel);
    }


    this.terminalCmp.send(`${text}\r`);

    const clearLine = false;
    if (clearLine) {
      if (text && selEmpty) {
        ed.pushUndoStop();
        ed.executeEdits('', [{
          identifier: { major: 1, minor: 0 },
          range: new monaco.Range(line, 1, line, maxCol), text: '', forceMoveMarkers: true
        }]);
      }
    } else {
      ed.setSelection(new monaco.Range(line, 1, line, maxCol));
    }
  }

  ngOnDestroy(): void {
    this.toDispose.forEach(it => it.dispose());
  }

  focusEditor() {
    this.editor.focus();
  }
}
