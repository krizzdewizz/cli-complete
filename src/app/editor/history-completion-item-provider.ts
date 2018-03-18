import { getEditor, Suggest } from './editors';
import { CompletionItemProviderOrder } from './completion-item-provider';


export class HistoryCompletionItemProvider implements monaco.languages.CompletionItemProvider {

    triggerCharacters = ['\t'];

    constructor() {
    }

    provideCompletionItems(model: monaco.editor.IReadOnlyModel, position: monaco.Position, token: monaco.CancellationToken): monaco.languages.CompletionItem[] | monaco.Thenable<monaco.languages.CompletionItem[]> | monaco.languages.CompletionList | monaco.Thenable<monaco.languages.CompletionList> {
        const editorId = model.uri.authority;
        const info = getEditor(editorId);
        if (info.suggest !== Suggest.HISTORY) {
            return Promise.resolve([]);
        }
        const history = info.history;
        const set = {};
        history.list.forEach(it => set[it] = true);

        return Object.keys(set).map(it => ({
            label: it,
            kind: monaco.languages.CompletionItemKind.Text,
            sortText: CompletionItemProviderOrder.HISTORY,
            detail: 'History'
        }));
    }

    resolveCompletionItem?(item: monaco.languages.CompletionItem, token: monaco.CancellationToken): monaco.languages.CompletionItem | monaco.Thenable<monaco.languages.CompletionItem> {
        return item;
    }
}