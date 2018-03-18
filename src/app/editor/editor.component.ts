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
import { registerLanguage, CLIC_LANG_ID } from './language';
import { addEditor, EditorInfo, deleteEditor, Suggest } from './editors';

@Component({
  selector: 'clic-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss']
})
export class EditorComponent implements AfterViewInit, OnDestroy {

  private toDispose: monaco.IDisposable[] = [];
  private subscriptions: ISubscription[] = [];
  private style = { ...Style };
  private ignoreChangeEvent: boolean;
  private suggestCompletionContext: monaco.editor.IContextKey<Suggest>;

  id: string;
  editor: monaco.editor.IStandaloneCodeEditor;
  prompt = '';
  info: EditorInfo;

  setTabTitle: (title: string) => void = () => undefined;

  @ViewChild('editorElement') editorElement: ElementRef;
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

  constructor(
    public elRef: ElementRef,
    private promptService: PromptService,
    private fontSizeWheelService: FontSizeWheelService) {
  }

  private get suggestWidget() {
    return (this.editor as any).contentWidgets['editor.widget.suggestWidget'].widget;
  }

  selectSuggestionAndReopen() {
    const suggestVisible = this.suggestWidget.suggestWidgetVisible.get();
    if (suggestVisible) {
      this.selectSuggestion(false);
      if (this.info.suggest === Suggest.HISTORY) {
        return;
      }
    }
    this.suggest = Suggest.DIR;
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

    registerLanguage();

    this.info = addEditor(this.id);

    this.subscriptions.push(
      this.info.history.select.subscribe(item => this.selectHistory(item))
    );

    this.subscriptions.push(
      appEvent.layout.subscribe(() => this.editor.layout()),
    );

    const ed = this.editor = monaco.editor.create(this.editorElement.nativeElement, this.editorOptions);
    const model = monaco.editor.createModel('', CLIC_LANG_ID, monaco.Uri.parse(`clic://${this.id}`));
    ed.setModel(model);

    this.suggestCompletionContext = ed.createContextKey('clicSuggest', Suggest.HISTORY);

    //     this.content = `echo off & prompt $s
    // dir
    // cls
    // forever`;

    ed.onDidChangeModelContent(e => {
      if (this.ignoreChangeEvent) {
        return;
      }
      appEvent.saveLayoutAuto.next();
      const change = e.changes[0];
      if (change.text.endsWith('\\')) {
        this.suggest = Suggest.DIR;
        ed.getAction('editor.action.triggerSuggest').run();
      } else {
        this.suggest = Suggest.HISTORY;
      }
    });

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

    this.toDispose.push(...createEditorActions(this));
  }

  private set suggest(suggest: Suggest) {
    this.info.suggest = suggest;
    this.suggestCompletionContext.set(suggest);
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

    this.info.history.push(text);
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
    deleteEditor(this.id);
  }

  focus() {
    this.editor.focus();
  }

  get isFocused(): boolean {
    return this.editor.isFocused();
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
    this.info.sessionInfo = sessionInfo;
    this.subscriptions.push(this.promptService.getPrompt(sessionInfo).subscribe(prompt => {
      this.prompt = prompt;
      this.setTabTitle(prompt || 'clic');
    }));
    this.promptService.promptMayChanged(sessionInfo);
  }

  pasteFromClipboard() {
  }

  get content(): string {
    return this.editor.getValue();
  }

  set content(value: string) {
    try {
      this.ignoreChangeEvent = true;
      this.editor.setValue(value);
    } finally {
      this.ignoreChangeEvent = false;
    }
  }

  selectFirstLine() {
    const ed = this.editor;
    const maxCol = ed.getModel().getLineMaxColumn(1);
    ed.setSelection(new monaco.Range(1, 1, 1, maxCol));
  }
}
