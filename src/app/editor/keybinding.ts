import { IUserFriendlyKeybinding } from '@lib/vs/workbench/services/keybinding/common/keybinding';
import { KeybindingIO } from '@lib/vs/workbench/services/keybinding/common/keybindingIO';
import { toCode } from '../frame/keyboard';

const { remote } = window.require('electron');
const { loadSettings } = remote.require('./settings');
const { KEYBINDINGS_FILE } = remote.require('./keybindings-json');

export function addUserBindings(editor: monaco.editor.IStandaloneCodeEditor) {
    const bindings: IUserFriendlyKeybinding[] = loadSettings(KEYBINDINGS_FILE, []);

    bindings.forEach(it => {
        const action = editor.getAction(it.command);
        if (!action) {
            return;
        }
        editor.addCommand(toCode(KeybindingIO.readKeybinding(it.key)), () => action.run(), '');
    });
}
