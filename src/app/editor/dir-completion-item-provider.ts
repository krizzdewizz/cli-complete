import { FS } from './file-system';
import { CompletionItemProviderOrder } from './completion-item-provider';
import { parsePathPrefix, explodeRelPath } from '@util/util';
import { getEditor, Suggest } from './editors';

function quote(s: string): string {
    return s.includes(' ') ? `"${s}"` : s;
}

function isDirCmd(s: string) {
    return s.trimLeft().startsWith('cd ');
}

function toInsert(s: string): string {
    const ex = explodeRelPath(s);
    return quote(ex);
}

export async function getCompletions(pid: number, line: string, offset: number, position: monaco.Position, ...kinds: monaco.languages.CompletionItemKind[]): Promise<monaco.languages.CompletionItem[]> {
    const part = line.substring(0, offset);
    const prefix = part === '\\' ? part : parsePathPrefix(part).prefix;

    const cwd = (await FS.processInfo(pid)).cwd;
    let explodedPath: string;
    const exploded = [false];
    let baseDir: string;
    if (prefix[1] === ':') { // win32 drive hack
        baseDir = prefix;
    } else {
        if (prefix[0] === '\\') {
            baseDir = FS.join(cwd.substring(0, 2), prefix); // c: or d: WIN ONLY
        } else {
            explodedPath = explodeRelPath(prefix, exploded);
            baseDir = FS.join(cwd, explodedPath);
            // console.log('part', part, 'prefix:', prefix, 'x:', explodedPath, 'base:', baseDir);
        }
    }

    const toScan = prefix === '' || baseDir.endsWith('/') || baseDir.endsWith('\\') ? baseDir : FS.dirname(baseDir);

    let wantsFile = false;
    let wantsFolder = false;

    kinds.forEach(it => {
        if (it === monaco.languages.CompletionItemKind.File) {
            wantsFile = true;
        } else if (it === monaco.languages.CompletionItemKind.Folder) {
            wantsFolder = true;
        }
    });

    const files = await FS.readDir(toScan);

    let range: monaco.Range;
    let filterText: string;
    if (exploded[0]) {
        const { lineNumber, column } = position;
        range = new monaco.Range(lineNumber, 1, lineNumber, column);
        console.log('aa', range.containsPosition(position));
    }

    const all: monaco.languages.CompletionItem[] = [];
    for (const file of files) {
        const full = FS.join(toScan, file);
        const isDir = await FS.isDirectory(full);
        if (isDir === undefined) {
            continue;
        }

        let insertText;
        if (exploded[0]) {
            filterText = insertText = `${explodedPath}${toInsert(file)}`;
        } else {
            insertText = file;
        }
        if (isDir) {
            insertText = `${insertText}\\`;
        }

        const kind = isDir ? monaco.languages.CompletionItemKind.Folder : monaco.languages.CompletionItemKind.File;
        const include = wantsFolder && isDir || wantsFile && !isDir;
        if (include) {
            all.push({
                label: file,
                kind,
                detail: monaco.languages.CompletionItemKind[kind],
                sortText: `${CompletionItemProviderOrder.DIR}${isDir ? 'a' : 'b'}:${file}`,
                insertText,
                range,
                filterText
            });
        }
    }

    return all;
}

export class DirCompletionItemProvider implements monaco.languages.CompletionItemProvider {

    triggerCharacters = ['\\', '\t'];

    provideCompletionItems(model: monaco.editor.IReadOnlyModel, position: monaco.Position, token: monaco.CancellationToken): Promise<monaco.languages.CompletionItem[]> {

        const editorId = model.uri.authority;
        const info = getEditor(editorId);
        const sessionInfo = info.sessionInfo;
        if (info.suggest !== Suggest.DIR || !sessionInfo) {
            return Promise.resolve([]);
        }

        const pid = sessionInfo.pid;
        const { lineNumber, column } = position;

        const kinds = [monaco.languages.CompletionItemKind.Folder];
        const dirCmd = isDirCmd(model.getLineContent(lineNumber));
        if (!dirCmd) {
            kinds.push(monaco.languages.CompletionItemKind.File);
        }

        const line = model.getValueInRange(new monaco.Range(lineNumber, 0, lineNumber, model.getLineMaxColumn(lineNumber)));
        return getCompletions(pid, line, column, position, ...kinds);
    }

    resolveCompletionItem?(item: monaco.languages.CompletionItem, token: monaco.CancellationToken): monaco.languages.CompletionItem | monaco.Thenable<monaco.languages.CompletionItem> {
        return item;
    }
}
