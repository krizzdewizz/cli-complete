import * as fs from 'fs';
import * as path from 'path';
import { MONACO_ACTIONS } from './monaco-actions';

const KEYBINDINGS_FILE = 'keybindings.json';

export const CLIC_ACTIONS = {
    send: {
        id: 'send',
        label: 'Send Line or Selection'
    },
    selectSuggestionAndSend: {
        id: 'select-suggestion-and-send',
        label: 'Selection Suggestion and Send',
    },
    selectSuggestion: {
        id: 'select-suggestion',
        label: 'Selection Suggestion',
    },
    triggerDirectorySuggest: {
        id: 'trigger-directory-suggest',
        label: 'Trigger Directory Suggest',
    },
    selectAndTriggerDirectorySuggest: {
        id: 'select-and-trigger-directory-suggest',
        label: 'Select and Trigger Directory Suggest',
    },
    sendBreak: {
        id: 'send-break',
        label: 'Send Break Signal',
    },
    focusTerminal: {
        id: 'focus-terminal',
        label: 'Focus Terminal',
    },
    historyNext: {
        id: 'history-next',
        label: 'History Next',
    },
    historyPrev: {
        id: 'history-prev',
        label: 'History Previous',
    },
    resetFontSize: {
        id: 'reset-font-size',
        label: 'Reset Font Size',
    },
    commands: {
        id: 'commands',
        label: 'Command Palette',
    }
};

export function createKeybindingsJson(dir: string) {
    const file = path.join(dir, KEYBINDINGS_FILE);
    if (!fs.existsSync(file)) {
        fs.writeFileSync(file, makeKeybindingsJson());
    }
}

export function getUnsupportedActions(): { [id: string]: boolean } {
    const unsupported = {};
    MONACO_ACTIONS
        .filter(it => it.unsupported)
        .map(it => unsupported[it.id] = true);
    return unsupported;
}

function makeKeybindingsJson(): string {
    const entries = [...Object.keys(CLIC_ACTIONS).map(k => CLIC_ACTIONS[k]), ...MONACO_ACTIONS]
        .filter(it => !it.unsupported)
        .map(it => ({ key: '', command: it.id }))
        .map(it => `  // ${JSON.stringify(it)}`)
        .join('\n');

    return `// Place your key bindings in this file to overwrite the defaults
[
${entries}
]
`;
}
