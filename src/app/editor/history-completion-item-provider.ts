import { EditorHistory } from './history';

export class HistoryCompletionItemProvider implements monaco.languages.CompletionItemProvider {

    triggerCharacters = ['\t'];

    constructor(private history: EditorHistory) {
    }

    provideCompletionItems(model: monaco.editor.IReadOnlyModel, position: monaco.Position, token: monaco.CancellationToken): monaco.languages.CompletionItem[] | monaco.Thenable<monaco.languages.CompletionItem[]> | monaco.languages.CompletionList | monaco.Thenable<monaco.languages.CompletionList> {

        const set = {};
        this.history.list.forEach(it => {
            set[it] = true;
        });

        return Object.keys(set).map(it => ({
            label: it,
            kind: monaco.languages.CompletionItemKind.Text,
            detail: 'History'
        }));
    }

    resolveCompletionItem?(item: monaco.languages.CompletionItem, token: monaco.CancellationToken): monaco.languages.CompletionItem | monaco.Thenable<monaco.languages.CompletionItem> {
        return item;
    }
}