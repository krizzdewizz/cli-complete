import { appEvent } from '@services/app-event';
import { KeybindingIO } from '@lib/vs/workbench/services/keybinding/common/keybindingIO';
import { KeybindingType, SimpleKeybinding, Keybinding } from '@lib/vs/workbench/services/keybinding/common/keyCodes';
import { IUserFriendlyKeybinding } from '@lib/vs/workbench/services/keybinding/common/keybinding';

const { remote } = window.require('electron');
const { GLOBAL_ACTIONS } = remote.require('./cli-complete-actions');
const { KEYBINDINGS_FILE } = remote.require('./keybindings-json');
const { loadSettings } = remote.require('./settings');

function fixCode(s: string) {

    switch (s) {
        case 'Backslash':
            return '\\';
        case 'Slash':
            return '/';
    }

    const key = 'Key';
    if (s.startsWith(key)) {
        return s.substring(key.length);
    }

    const digit = 'Digit';
    if (s.startsWith(digit)) {
        return s.substring(digit.length);
    }

    return s;
}

export function toCode(binding: Keybinding): number {
    let code: number;
    if (binding.type === KeybindingType.Simple) {
        code = _toCode(binding);
    } else if (binding.type === KeybindingType.Chord) {
        code = monaco.KeyMod.chord(_toCode(binding.firstPart), _toCode(binding.chordPart));
    }
    return code;
}

// tslint:disable:no-bitwise
function _toCode(b: SimpleKeybinding): number {
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

function keyToAccel(e: KeyboardEvent): string {
    let accel = '';
    if (e.ctrlKey) {
        accel += 'ctrl';
        accel += '+';
    }
    if (e.altKey) {
        accel += 'alt';
        accel += '+';
    }
    if (e.shiftKey) {
        accel += 'shift';
        accel += '+';
    }
    accel += fixCode(e.code);
    return accel.toLowerCase();
}

const actions: { [command: string]: () => void } = {
    [GLOBAL_ACTIONS.newTerminal.command]: () => appEvent.newTerminal.next(),
    [GLOBAL_ACTIONS.closeTerminal.command]: () => appEvent.closeTerminal.next(),
    [GLOBAL_ACTIONS.split.command]: () => appEvent.splitEditor.next(),
    [GLOBAL_ACTIONS.focusTerminal1.command]: () => appEvent.selectTab.next(1),
    [GLOBAL_ACTIONS.focusTerminal2.command]: () => appEvent.selectTab.next(2),
    [GLOBAL_ACTIONS.focusTerminal3.command]: () => appEvent.selectTab.next(3),
    [GLOBAL_ACTIONS.focusTerminal4.command]: () => appEvent.selectTab.next(4),
    [GLOBAL_ACTIONS.focusTerminal5.command]: () => appEvent.selectTab.next(5),
    [GLOBAL_ACTIONS.focusTerminal6.command]: () => appEvent.selectTab.next(6),
    [GLOBAL_ACTIONS.focusTerminal7.command]: () => appEvent.selectTab.next(7),
    [GLOBAL_ACTIONS.focusTerminal8.command]: () => appEvent.selectTab.next(8),
    [GLOBAL_ACTIONS.focusTerminal9.command]: () => appEvent.selectTab.next(9),
};

let codeToAction: { [code: number]: () => void };

export function registerKeyboardActions() {

    if (codeToAction) {
        return;
    }

    codeToAction = {};

    const bindings: IUserFriendlyKeybinding[] = [
        ...Object.keys(GLOBAL_ACTIONS).map(k => GLOBAL_ACTIONS[k]),
        ...loadSettings(KEYBINDINGS_FILE, [])
    ];

    bindings
        .filter(it => it.command.startsWith('clic.global') && actions[it.command])
        .forEach(it => {
            const binding = KeybindingIO.readKeybinding(it.key);
            if (binding.type === KeybindingType.Simple) {
                codeToAction[toCode(binding)] = actions[it.command];
            }
        });

    window.addEventListener('keydown', e => {
        const accel = keyToAccel(e);
        // console.log('keydown', accel);
        const binding = KeybindingIO.readKeybinding(accel);
        if (binding.type === KeybindingType.Simple) {
            const action = codeToAction[toCode(binding)];
            if (action) {
                action();
                e.preventDefault();
                e.stopPropagation();
                e.cancelBubble = true;
            }
        }
    }, true);
}
