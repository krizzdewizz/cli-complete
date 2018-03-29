import { IUserFriendlyKeybinding } from '@lib/vs/workbench/services/keybinding/common/keybinding';
import { KeybindingIO } from '@lib/vs/workbench/services/keybinding/common/keybindingIO';
import { KeybindingType, SimpleKeybinding } from '@lib/vs/workbench/services/keybinding/common/keyCodes';

const { remote } = window.require('electron');
const { loadSettings } = remote.require('./settings');

// tslint:disable:no-bitwise
function toCode(b: SimpleKeybinding): number {
    let code = b.keyCode;
    if (b.ctrlKey) {
        code |= monaco.KeyMod.CtrlCmd;
    }
    if (b.altKey) {
        code |= monaco.KeyMod.Alt;
    }
    if (b.shiftKey) {
        code |= monaco.KeyMod.Shift;
    }
    return code;
}

export function addUserBindings(editor: monaco.editor.IStandaloneCodeEditor) {
    const bindings: IUserFriendlyKeybinding[] = loadSettings('keybindings.json', []);

    bindings.forEach(it => {
        const action = editor.getAction(it.command);
        if (!action) {
            return;
        }

        const binding = KeybindingIO.readKeybinding(it.key);
        let code: number;

        if (binding.type === KeybindingType.Simple) {
            code = toCode(binding);
        } else if (binding.type === KeybindingType.Chord) {
            code = monaco.KeyMod.chord(toCode(binding.firstPart), toCode(binding.chordPart));
        }

        editor.addCommand(code, () => action.run(), '');
    });
}
