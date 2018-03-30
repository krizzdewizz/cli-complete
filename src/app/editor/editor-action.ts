import { EditorComponent } from './editor.component';
import { addUserBindings } from './keybinding';

const { remote } = window.require('electron');
const { getUnsupportedMonacoActions } = remote.require('./keybindings-json');
const { EDITOR_ACTIONS } = remote.require('./cli-complete-actions');

function unbindDefaultAction(ed, actionId: string) {
    ed._standaloneKeybindingService.addDynamicKeybinding(`-${actionId}`);
}

function hideActions(ed: monaco.editor.IStandaloneCodeEditor) {
    const unsupported = getUnsupportedMonacoActions();
    Object
        .keys(unsupported)
        .forEach(actionId => unbindDefaultAction(ed, actionId));

    const orig = ed.getSupportedActions.bind(ed);
    ed.getSupportedActions = () => orig().filter(it => !unsupported[it.id]);
}

// tslint:disable:no-bitwise
export function createEditorActions(editor: EditorComponent): monaco.IDisposable[] {

    const ed = editor.editor;

    hideActions(ed);

    const toDispose = [
        ed.addAction({
            ...EDITOR_ACTIONS.send,
            keybindings: [monaco.KeyCode.Enter],
            run: () => editor.send(),
            keybindingContext: 'editorTextFocus'
        }),

        // ed.addAction({
        //     id: 'pipe-to-editor',
        //     label: 'Pipe to Editor',
        //     keybindings: [monaco.KeyCode.F9],
        //     run: () => appEvent.pipeToQEditor.next(editor.elRef.nativeElement),
        //     keybindingContext: 'editorTextFocus'
        // }),

        ed.addAction({
            ...EDITOR_ACTIONS.selectSuggestionAndSend,
            keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter],
            run: () => editor.selectSuggestion(),
            keybindingContext: 'suggestWidgetVisible'
        }),

        ed.addAction({
            ...EDITOR_ACTIONS.selectSuggestion,
            keybindings: [monaco.KeyMod.Shift | monaco.KeyCode.Enter],
            run: () => editor.selectSuggestion(false),
            keybindingContext: 'suggestWidgetVisible'
        }),

        ed.addAction({
            ...EDITOR_ACTIONS.triggerDirectorySuggest,
            keybindings: [monaco.KeyCode.Tab],
            run: () => editor.selectSuggestionAndReopen(false),
            keybindingContext: 'editorTextFocus',
        }),

        ed.addAction({
            ...EDITOR_ACTIONS.selectAndTriggerDirectorySuggest,
            keybindings: [monaco.KeyCode.Tab, monaco.KeyCode.US_BACKSLASH],
            run: () => editor.selectSuggestionAndReopen(true),
            keybindingContext: 'editorTextFocus && suggestWidgetVisible && clicSuggest==1',
        }),

        ed.addAction({
            ...EDITOR_ACTIONS.sendBreak,
            keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_C],
            run: () => editor.ctrlC()
        }),

        ed.addAction({
            ...EDITOR_ACTIONS.focusTerminal,
            keybindings: [monaco.KeyCode.F6],
            run: () => editor.terminalCmp.focus()
        }),

        ed.addAction({
            ...EDITOR_ACTIONS.historyNext,
            keybindings: [monaco.KeyMod.Alt | monaco.KeyCode.RightArrow],
            run: () => editor.info.history.next()
        }),

        ed.addAction({
            ...EDITOR_ACTIONS.historyPrev,
            keybindings: [monaco.KeyMod.Alt | monaco.KeyCode.LeftArrow],
            run: () => editor.info.history.prev()
        }),

        ed.addAction({
            ...EDITOR_ACTIONS.resetFontSize,
            keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.NUMPAD_0],
            run: () => editor.setFontSize()
        }),

        ed.addAction({
            ...EDITOR_ACTIONS.quickCommand,
            keybindings: [monaco.KeyCode.F1],
            run: () => editor.quickOpen()
        }),

        ed.addAction({
            ...EDITOR_ACTIONS.clearScreen,
            keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_Q],
            run: () => editor.terminalCmp.clear()
        }),

        ed.addAction({
            ...EDITOR_ACTIONS.clipboardCopyAction,
            keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KEY_C],
            run: () => ed.getAction('editor.action.clipboardCopyAction').run()
        }),
    ];

    addUserBindings(ed);

    return toDispose;
}
