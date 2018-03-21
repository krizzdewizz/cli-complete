import { HistoryCompletionItemProvider } from './history-completion-item-provider';
import { DirCompletionItemProvider } from './dir-completion-item-provider';

export const CLIC_LANG_ID = 'cli-complete';

let registered = false;

export function registerLanguage() {
    if (registered) {
        return;
    }

    monaco.languages.register({ id: CLIC_LANG_ID });
    monaco.languages.registerCompletionItemProvider(CLIC_LANG_ID, new HistoryCompletionItemProvider());
    monaco.languages.registerCompletionItemProvider(CLIC_LANG_ID, new DirCompletionItemProvider());
    registered = true;
}
