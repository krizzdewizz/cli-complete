import { HistoryCompletionItemProvider } from './history-completion-item-provider';
import { DirCompletionItemProvider } from './dir-completion-item-provider';

export const CLIC_LANG_ID = 'cli-complete';

let registered = false;
const colorAccentDark = '#800080';
const colorAccentDark2 = '#330033';

export function registerLanguage() {
    if (registered) {
        return;
    }

    monaco.languages.register({ id: CLIC_LANG_ID });
    monaco.languages.registerCompletionItemProvider(CLIC_LANG_ID, new HistoryCompletionItemProvider());
    monaco.languages.registerCompletionItemProvider(CLIC_LANG_ID, new DirCompletionItemProvider());
    monaco.editor.defineTheme('cli-complete-theme', {
        base: 'vs-dark',
        inherit: true,
        rules: [],
        colors: {
            'editor.selectionBackground': colorAccentDark,
            'editorSuggestWidget.selectedBackground': colorAccentDark2,
            'editorSuggestWidget.highlightForeground': '#cc00cc'
        }
    });
    registered = true;
}

