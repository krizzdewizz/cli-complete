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
            keybindings: [monaco.KeyMod.chord(monaco.KeyMod.Shift | monaco.KeyCode.Enter, undefined)],
            run: () => editor.selectSuggestion(),
            keybindingContext: 'suggestWidgetVisible'
        }),

        ed.addAction({
            id: 'triggy',
            label: 'Trigger Suggest',
            keybindings: [monaco.KeyCode.Tab],
            run: () => editor.selectSuggestionAndReopen(),
            keybindingContext: 'editorTextFocus',
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
            run: () => editor.history.next()
        }),

        ed.addAction({
            id: 'history-prev',
            label: 'History Previous',
            keybindings: [monaco.KeyMod.chord(monaco.KeyMod.Alt | monaco.KeyCode.LeftArrow, undefined)],
            run: () => editor.history.prev()
        }),
    ];
}
