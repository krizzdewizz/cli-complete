import { EditorComponent } from './editor.component';
import { appEvent } from '@services/app-event';

// tslint:disable:no-bitwise
export function createEditorActions(editor: EditorComponent): monaco.IDisposable[] {

    const ed = editor.editor;

    return [
        ed.addAction({
            id: 'send',
            label: 'Send Line or Selection',
            keybindings: [monaco.KeyCode.Enter],
            run: () => editor.send(),
            keybindingContext: 'editorTextFocus'
        }),

        ed.addAction({
            id: 'pipe-to-editor',
            label: 'Pipe to Editor',
            keybindings: [monaco.KeyCode.F9],
            run: () => appEvent.pipeToQEditor.next(editor.elRef.nativeElement),
            keybindingContext: 'editorTextFocus'
        }),

        ed.addAction({
            id: 'select-suggestion-and-send',
            label: 'Selection Suggestion and Send',
            keybindings: [monaco.KeyMod.chord(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, undefined)],
            run: () => editor.selectSuggestion(),
            keybindingContext: 'suggestWidgetVisible'
        }),

        ed.addAction({
            id: 'select-suggestion',
            label: 'Selection Suggestion',
            keybindings: [monaco.KeyMod.chord(monaco.KeyMod.Shift | monaco.KeyCode.Enter, undefined)],
            run: () => editor.selectSuggestion(false),
            keybindingContext: 'suggestWidgetVisible'
        }),

        ed.addAction({
            id: 'trigger-directory-suggest',
            label: 'Trigger Directory Suggest',
            keybindings: [monaco.KeyCode.Tab],
            run: () => editor.selectSuggestionAndReopen(false),
            keybindingContext: 'editorTextFocus',
        }),

        ed.addAction({
            id: 'select-and-trigger-directory-suggest',
            label: 'Select and Trigger Directory Suggest',
            keybindings: [monaco.KeyCode.Tab, monaco.KeyCode.US_BACKSLASH],
            run: () => editor.selectSuggestionAndReopen(true),
            keybindingContext: 'editorTextFocus && suggestWidgetVisible && clicSuggest==1',
        }),

        ed.addAction({
            id: 'send-break',
            label: 'Send Break Signal',
            keybindings: [monaco.KeyMod.chord(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_C, undefined)],
            run: () => editor.ctrlC()
        }),

        ed.addAction({
            id: 'focus-terminal',
            label: 'Focus Terminal',
            keybindings: [monaco.KeyCode.F6],
            run: () => editor.terminalCmp.focus()
        }),

        ed.addAction({
            id: 'history-next',
            label: 'History Next',
            keybindings: [monaco.KeyMod.chord(monaco.KeyMod.Alt | monaco.KeyCode.RightArrow, undefined)],
            run: () => editor.info.history.next()
        }),

        ed.addAction({
            id: 'history-prev',
            label: 'History Previous',
            keybindings: [monaco.KeyMod.chord(monaco.KeyMod.Alt | monaco.KeyCode.LeftArrow, undefined)],
            run: () => editor.info.history.prev()
        }),

        ed.addAction({
            id: 'reset-font-size',
            label: 'Reset Font Size',
            keybindings: [monaco.KeyMod.chord(monaco.KeyMod.CtrlCmd | monaco.KeyCode.NUMPAD_0, undefined)],
            run: () => editor.resetFontSize()
        }),
    ];
}
