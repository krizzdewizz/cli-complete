import { Component, ViewChild, OnDestroy, AfterViewInit, ElementRef } from '@angular/core';
import { TerminalComponent } from '../terminal/terminal.component';
import { Style } from '@style/style';
import { PromptService } from '@services/prompt.service';
import { ISubscription } from 'rxjs/Subscription';
import { SessionInfo } from '@model/model';
import { handleCtrlC } from './ctrl-c';
import { createEditorActions } from './editor-action';
import { FontSizeWheelService } from '@services/font-size-wheel.service';
import { appEvent } from '@services/app-event';
import { EditorHistory } from './history';
import { HistoryCompletionItemProvider } from './history-completion-item-provider';
import { DirCompletionItemProvider } from './dir-completion-item-provider';

@Component({
  selector: 'clic-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss']
})
export class EditorComponent implements AfterViewInit, OnDestroy {

  private toDispose: monaco.IDisposable[];
  private subscriptions: ISubscription[] = [];
  private sessionInfo: SessionInfo;
  private style = { ...Style };
  private dirCompletionItemProvider = new DirCompletionItemProvider();
  history = new EditorHistory();

  prompt = '';

  setTabTitle: (title: string) => void = () => undefined;

  @ViewChild('editor') editorCmp;
  @ViewChild(TerminalComponent) terminalCmp: TerminalComponent;

  editorOptions: monaco.editor.IEditorConstructionOptions = {
    ...this.style,
    theme: 'vs-dark',
    lineNumbers: 'off',
    minimap: { enabled: false },
    acceptSuggestionOnEnter: 'off',
    // suggestOnTriggerCharacters: true,
    // acceptSuggestionOnCommitCharacter: true,
    // language: 'javascript',
  };
  // code = '';
  // code = String(new Date(Date.now()) + '\n\n');
  code = `echo off & prompt $s
dir
cls
forever`;

  constructor(
    public elRef: ElementRef,
    private promptService: PromptService,
    private fontSizeWheelService: FontSizeWheelService) {
  }

  get editor(): monaco.editor.IStandaloneCodeEditor {
    return this.editorCmp._editor;
  }

  private get suggestWidget() {
    return (this.editor as any).contentWidgets['editor.widget.suggestWidget'].widget;
  }

  selectSuggestionAndReopen() {
    const suggestVisible = this.suggestWidget.suggestWidgetVisible.get();
    if (suggestVisible) {
      this.selectSuggestion(false);
    }
    this.editor.getAction('editor.action.triggerSuggest').run();
  }

  selectSuggestion(focusAndSend = true) {
    const suggestWidget = this.suggestWidget;
    const item = suggestWidget.getFocusedItem();
    suggestWidget.onDidSelectEmitter.fire(item);
    if (focusAndSend) {
      this.editor.focus();
      this.send();
    }
  }

  ngAfterViewInit() {

    this.subscriptions.push(
      this.history.select.subscribe(item => this.selectHistory(item))
    );

    this.subscriptions.push(
      appEvent.layout.subscribe(() => this.editor.layout()),
    );

    if (!this.editorCmp._editor) {
      this.editorCmp.initMonaco(this.editorCmp.options);
    }

    const ed = this.editor;

    ed.onDidChangeModelContent(e => {
      const change = e.changes[0];
      if (change.text === '\\') {
        ed.getAction('editor.action.triggerSuggest').run();
      }
    });

    monaco.languages.registerCompletionItemProvider('*', new HistoryCompletionItemProvider(this.history));
    monaco.languages.registerCompletionItemProvider('*', this.dirCompletionItemProvider);

    ed.getDomNode().addEventListener('wheel', e => {
      if (this.fontSizeWheelService.onWheel(this.style, e)) {
        ed.updateOptions({ fontSize: this.style.fontSize });
      }
    });

    const line = ed.getSelection().startLineNumber;
    const maxCol = ed.getModel().getLineMaxColumn(line);
    ed.setSelection(new monaco.Range(line, maxCol, line, maxCol));

    ed.layout();
    ed.focus();

    this.toDispose = createEditorActions(this);
  }

  ctrlC() {
    handleCtrlC(
      () => this.terminalCmp.send(String.fromCharCode(3), false),
      () => this.editor.getAction('editor.action.clipboardCopyAction').run()
    );
  }

  selectHistory(text: string) {
    const ed = this.editor;
    const model = ed.getModel();
    const sel = ed.getSelection();
    const line = sel.startLineNumber;
    const maxCol = model.getLineMaxColumn(line);
    ed.executeEdits('', [{
      identifier: { major: 1, minor: 0 },
      range: new monaco.Range(line, 1, line, maxCol), text, forceMoveMarkers: true
    }]);
  }

  send() {
    if (!this.hasSession) {
      this.restart();
      return;
    }

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

    this.history.push(text);
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
    this.subscriptions.forEach(it => it.unsubscribe());
  }

  focusEditor() {
    this.editor.focus();
  }

  get hasSession() {
    const termCmp = this.terminalCmp;
    if (!termCmp) {
      return true;
    }

    return termCmp.hasSession;
  }

  restart() {
    this.terminalCmp.startSession();
    this.editor.focus();
  }

  onSessionInfo(sessionInfo: SessionInfo) {
    this.sessionInfo = sessionInfo;
    this.dirCompletionItemProvider.pid = sessionInfo.pid;
    this.subscriptions.push(this.promptService.getPrompt(sessionInfo).subscribe(prompt => {
      this.prompt = prompt;
      this.setTabTitle(prompt || 'clic');
    }));
    this.promptService.promptMayChanged(sessionInfo);
  }

  pasteFromClipboard() {
  }
}
