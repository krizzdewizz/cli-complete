import { EditorComponent } from './editor.component';
import { eventBus } from '@services/app-event';

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
            id: 'send-break',
            label: 'Send Break Signal',
            // tslint:disable-next-line:no-bitwise
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
            id: 'new-terminal',
            label: 'New Terminal',
            // tslint:disable-next-line:no-bitwise
            keybindings: [monaco.KeyMod.chord(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_T, undefined)],
            run: () => eventBus.newTerminal.next()
        }),

        ed.addAction({
            id: 'close-terminal',
            label: 'Close Terminal',
            // tslint:disable-next-line:no-bitwise
            keybindings: [monaco.KeyMod.chord(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_W, undefined)],
            run: () => eventBus.closeTerminal.next(editor.elRef.nativeElement)
        })
    ];
}