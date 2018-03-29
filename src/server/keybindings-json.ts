import * as fs from 'fs';
import * as path from 'path';
import { MONACO_ACTIONS } from './monaco-actions';
import { EDITOR_ACTIONS, GLOBAL_ACTIONS, } from './cli-complete-actions';

export const KEYBINDINGS_FILE = 'keybindings.json';

export function createKeybindingsJson(dir: string) {
    const file = path.join(dir, KEYBINDINGS_FILE);
    if (!fs.existsSync(file)) {
        fs.writeFileSync(file, makeKeybindingsJson());
    }
}

export function getUnsupportedMonacoActions(): { [id: string]: boolean } {
    const unsupported = {};
    MONACO_ACTIONS
        .filter(it => it.unsupported)
        .map(it => unsupported[it.id] = true);
    return unsupported;
}

function makeKeybindingsJson(): string {
    const entries = [
        ...Object.keys(GLOBAL_ACTIONS).map(k => GLOBAL_ACTIONS[k]),
        ...Object.keys(EDITOR_ACTIONS).map(k => EDITOR_ACTIONS[k]),
        ...MONACO_ACTIONS
    ]
        .filter(it => !it.unsupported)
        .map(it => ({ key: '', command: it.id || it.command }))
        .map(it => `  // ${JSON.stringify(it)}`)
        .join('\n');

    return `// Place your key bindings in this file to overwrite the defaults
[
${entries}
]
`;
}
