import { FS } from './file-system';
import { CompletionItemProviderOrder } from './completion-item-provider';
import { parsePathPrefix, explodeRelPath } from '@util/util';

function quote(s: string): string {
    return s.includes(' ') ? `"${s}"` : s;
}

function toInsert(s: string): string {
    const ex = explodeRelPath(s);
    return quote(ex);
}

export async function getCompletions(pid: number, line: string, offset: number, position: monaco.Position, ...kinds: monaco.languages.CompletionItemKind[]): Promise<monaco.languages.CompletionItem[]> {
    const part = line.substring(0, offset);
    const prefix = part === '\\' ? part : parsePathPrefix(part).prefix;

    const cwd = (await FS.cwd(pid)).cwd;
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

    pid: number;

    provideCompletionItems(model: monaco.editor.IReadOnlyModel, position: monaco.Position, token: monaco.CancellationToken): Promise<monaco.languages.CompletionItem[]> {

        const { lineNumber, column } = position;

        const line = model.getValueInRange(new monaco.Range(lineNumber, 0, lineNumber, model.getLineMaxColumn(lineNumber)));
        return getCompletions(this.pid, line, column, position, monaco.languages.CompletionItemKind.Folder, monaco.languages.CompletionItemKind.File);
    }

    resolveCompletionItem?(item: monaco.languages.CompletionItem, token: monaco.CancellationToken): monaco.languages.CompletionItem | monaco.Thenable<monaco.languages.CompletionItem> {
        return item;
    }
}
