import { Component, ViewChild, OnDestroy, AfterViewInit, ElementRef, HostListener, NgZone } from '@angular/core';
import { TerminalComponent } from '../terminal/terminal.component';
import { Style, getEditorLineHeight } from '@style/style';
import { PromptService, Prompt } from '@services/prompt.service';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { SessionInfo } from '@model/model';
import { handleCtrlC } from './ctrl-c';
import { createEditorActions } from './editor-action';
import { FontSizeWheelService } from '@services/font-size-wheel.service';
import { appEvent } from '@services/app-event';
import { registerLanguage, CLIC_LANG_ID } from './language';
import { addEditor, EditorInfo, deleteEditor, Suggest } from './editors';
import { FrameService } from '../frame/frame.service';
import { EditorHistory } from './history';

@Component({
  selector: 'clic-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss']
})
export class EditorComponent implements AfterViewInit, OnDestroy {

  private toDispose: monaco.IDisposable[] = [];
  private subscriptions: Subscription[] = [];
  private style = { ...Style };
  private ignoreChangeEvent: boolean;
  private suggestCompletionContext: monaco.editor.IContextKey<Suggest>;
  private prevLineCount: number;
  private historySelectSubscription: Subscription;

  active: boolean;
  id: string;
  editor: monaco.editor.IStandaloneCodeEditor;
  prompt: Prompt = { prompt: '' };
  info: EditorInfo;
  initialContent = '';
  initialCwd: string;
  initialHistory: string[] = [];
  initialFontSize = Style.fontSize;

  setTabTitle: (title: string) => void = () => undefined;

  @ViewChild('editorElement') editorElement: ElementRef;
  @ViewChild(TerminalComponent) terminalCmp: TerminalComponent;

  @HostListener('wheel', ['$event']) onWheel(e) {
    if (this.fontSizeWheelService.onWheel(this.style, e)) {
      this.setFontSize(this.style.fontSize);
    }
  }

  private getEditorOptions(): monaco.editor.IEditorConstructionOptions {
    return {
      ...{ ...this.style, fontSize: this.initialFontSize },
      theme: 'cli-complete-theme',
      lineNumbers: 'off',
      lineDecorationsWidth: 15,
      minimap: { enabled: false },
      acceptSuggestionOnEnter: 'off',
      lineHeight: getEditorLineHeight(this.initialFontSize),
      renderLineHighlight: 'none',
      occurrencesHighlight: false,
      scrollbar: {
        vertical: 'hidden'
      },
      overviewRulerLanes: 0,
      // suggestOnTriggerCharacters: true,
      // acceptSuggestionOnCommitCharacter: true,
      // language: CLIC_LANG_ID,
    };
  };

  constructor(
    public elRef: ElementRef,
    private promptService: PromptService,
    private frameService: FrameService,
    private fontSizeWheelService: FontSizeWheelService,
    private zone: NgZone) {
  }

  increaseFontSize(increase: boolean) {
    const newFontSize = this.fontSize + (increase ? 1 : -1);
    this.setFontSize(newFontSize);
  }

  setFontSize(fontSize = Style.fontSize, fromEvent = true) {
    this.editor.updateOptions({ fontSize: fontSize, lineHeight: getEditorLineHeight(fontSize) });
    this.terminalCmp.setFontSize(fontSize);
    if (fromEvent) {
      appEvent.saveLayout.emit();
      this.updateEditorHeight();

      const diff = fontSize - Style.fontSize;
      const diffString = diff === 0 ? '' : ` (${diff > 0 ? '+' : ''}${diff})`;
      this.zone.run(() => this.promptService.showInfoForAWhile(`${fontSize}px${diffString}`));
    }
  }

  private get suggestWidget() {
    return (this.editor as any).contentWidgets['editor.widget.suggestWidget'].widget;
  }

  private get quickOpenWidget() {
    return (this.editor as any).overlayWidgets['editor.contrib.quickOpenEditorWidget'].widget;
  }

  selectSuggestionAndReopen(selectSuggestion: boolean) {
    if (selectSuggestion) {
      const suggestVisible = this.suggestWidget.suggestWidgetVisible.get();
      if (suggestVisible) {
        this.selectSuggestion(false);
        if (this.info.suggest === Suggest.HISTORY) {
          return;
        }
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

  quickOpen() {
    this.editor.getAction('editor.action.quickCommand').run();
    const qo = $('.quick-open-widget', this.quickOpenWidget.domNode);
    const ed = $(this.editor.getDomNode());
    const { top, left } = ed.offset();
    const qoLeft = left + (ed.width() - qo.width()) / 2;
    qo.offset({ top: top - 20, left: qoLeft });
  }

  activate(): Promise<void> {
    if (this.active) {
      return Promise.resolve();
    }

    this.active = true;

    return new Promise(resolve => {
      setTimeout(() => {

        const ed = this.editor = monaco.editor.create(this.editorElement.nativeElement, this.getEditorOptions());
        const model = monaco.editor.createModel('', CLIC_LANG_ID, monaco.Uri.parse(`clic://${this.id}`));
        ed.setModel(model);

        this.suggestCompletionContext = ed.createContextKey('clicSuggest', Suggest.HISTORY);

        ed.onDidFocusEditorText(() => appEvent.focusEditor.next(this));

        ed.onMouseDown(e => {
          const { range, element } = e.target;
          if (element.classList.contains('clic-line-send')) {
            const line = range.startLineNumber;
            ed.setSelection(new monaco.Range(line, 0, line, ed.getModel().getLineMaxColumn(line)));
            ed.focus();
            this.send();
          }
        });

        ed.onDidChangeModelContent(e => {
          ed.deltaDecorations([], [
            { range: ed.getModel().getFullModelRange(), options: { isWholeLine: true, linesDecorationsClassName: 'clic-line-send' } },
          ]);

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

          this.updateEditorHeight();
        });

        this.content = this.initialContent;

        const line = ed.getSelection().startLineNumber;
        const maxCol = ed.getModel().getLineMaxColumn(line);
        ed.setSelection(new monaco.Range(line, maxCol, line, maxCol));

        ed.layout();

        this.toDispose.push(...createEditorActions(this));

        resolve();
      });
    });
  }

  setHistory(history: EditorHistory) {
    if (this.historySelectSubscription) {
      this.historySelectSubscription.unsubscribe();
    }
    this.historySelectSubscription = history.select.subscribe(item => this.selectHistory(item));
    this.info.history = history;
  }

  ngAfterViewInit() {
    registerLanguage();
    this.info = addEditor(this.id, this.initialHistory);
    this.setHistory(this.info.history);

    this.subscriptions.push(
      appEvent.layout
        .pipe(
          filter(() => Boolean(this.editor))
        )
        .subscribe(() => this.editor.layout()),
    );
  }

  private set suggest(suggest: Suggest) {
    this.info.suggest = suggest;
    this.suggestCompletionContext.set(suggest);
  }

  ctrlC() {
    handleCtrlC(
      this.editor.getSelection(),
      () => this.terminalCmp.sendCtrlC(),
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
    this.terminalCmp.send(text);

    const clearLine = false;
    if (clearLine) {
      if (text && selEmpty) {
        ed.pushUndoStop();
        ed.executeEdits('', [{
          identifier: { major: 1, minor: 0 },
          range: new monaco.Range(line, 1, line, maxCol), text: '', forceMoveMarkers: true
        }]);
      }
    } else if (sel.isEmpty()) {
      ed.setSelection(new monaco.Range(line, 1, line, maxCol));
    }
  }

  ngOnDestroy(): void {
    this.toDispose.forEach(it => it.dispose());
    this.subscriptions.forEach(it => it.unsubscribe());
    if (this.historySelectSubscription) {
      this.historySelectSubscription.unsubscribe();
    }
    deleteEditor(this.id);
  }

  focus() {
    this.editor.focus();
    this.updateEditorHeight(true);
  }

  get isFocused(): boolean {
    return this.editor && this.editor.isFocused();
  }

  get hasSession() {
    const termCmp = this.terminalCmp;
    if (!termCmp) {
      return true;
    }

    return termCmp.hasSession;
  }

  get sessionInfo(): SessionInfo {
    return this.terminalCmp ? this.terminalCmp._sessionInfo : undefined;
  }

  restart() {
    this.terminalCmp.startSession();
    this.editor.focus();
  }

  onSessionInfo(sessionInfo: SessionInfo) {
    this.info.sessionInfo = sessionInfo;
    this.subscriptions.push(this.promptService.getPrompt(sessionInfo).subscribe(prompt => {
      this.prompt = prompt;
      this.setTabTitle(this.prompt.prompt || 'cli-complete');
    }));
    this.frameService.autoexec(content => this.terminalCmp.send(content, { clear: false, writeDataToTerm: false }));
    this.promptService.promptMayChanged(sessionInfo);
  }

  pasteFromClipboard() {
    this.editor.getAction('editor.action.clipboardPasteAction').run();
    setTimeout(() => this.editor.focus()); // steal focus from terminal
  }

  get content(): string {
    return this.editor ? this.editor.getValue() : '';
  }

  set content(value: string) {
    try {
      this.ignoreChangeEvent = true;
      this.editor.setValue(value);
      this.updateEditorHeight();
    } finally {
      this.ignoreChangeEvent = false;
    }
  }

  selectFirstLine() {
    const ed = this.editor;
    const maxCol = ed.getModel().getLineMaxColumn(1);
    ed.setSelection(new monaco.Range(1, 1, 1, maxCol));
  }

  private updateEditorHeight(force = false) {
    const ed = this.editor;
    const lineCount = 1 + Math.min(10, ed.getModel().getLineCount());
    if (!force && this.prevLineCount === lineCount) {
      return;
    }
    this.prevLineCount = lineCount;
    const height = lineCount * getEditorLineHeight(this.fontSize);
    ed.getDomNode().style.height = `${height}px`;
    ed.layout();
  }

  get fontSize(): number {
    return this.editor ? this.editor.getConfiguration().fontInfo.fontSize : this.initialFontSize;
  }
}
