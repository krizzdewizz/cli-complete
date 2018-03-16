export function formatPath(path: string): string {
    return path.replace('\\', '/');
}

export interface Node {
    children?: Node[];
    contentItems?: Node[];
    parent: Node;
}

export function findAncestor<T extends Node>(node: T, filter: (node: T) => boolean) {
    return acceptParents(node, n => {
        if (filter(n)) {
            return n;
        }
    });
}

export function findDescendant<T extends Node>(node: T, filter: (node: T) => boolean) {
    return accept(node, n => {
        if (filter(n)) {
            return n;
        }
    });
}

export function acceptParents<R, T extends Node>(node: T, visitor: (node: T) => R): R {
    let result: R;
    let it = node;
    while (it) {
        if (result = visitor(it)) {
            return result;
        }
        it = it.parent as any;
    }
    return result;
}

export function accept<R, T extends Node>(node: T, visitor: (node: T) => R): R {
    if (!node) {
        return;
    }
    let result: R;
    if (result = visitor(node)) {
        return result;
    }
    const children = node.children || node.contentItems;
    if (children) {
        for (const child of children) {
            if (result = accept(child, visitor)) {
                return result;
            }
        }
    }
}

export function parsePathPrefix(line: string): { prefix: string, hadSpace?: boolean } {
    let inQuote: boolean;
    let prefix = '';
    for (let i = line.length - 1; i >= 0; i--) {
        const c = line[i];
        if (c === '"') {
            inQuote = !inQuote;
            continue;
        }

        if (c === ' ' && !inQuote) {
            return { prefix, hadSpace: true };
        }
        prefix = c + prefix;
    }
    return { prefix };
}

export function explodeRelPath(s: string, exploded = [false]): string {
    // .\ -> .\
    // ..\ -> ..\
    // ...\ -> ..\..\
    // ....\ -> ..\..\..\

    if (s[0] !== '.') {
        return s;
    }

    const pos = s.indexOf('\\');
    if (pos < 0) {
        return s;
    }

    const left = s.substring(0, pos);
    if (left.length < 3) {
        return s;
    }

    for (const c of left) {
        if (c !== '.') {
            return s;
        }
    }

    exploded[0] = true;

    // only dots
    let exp = '';
    for (let i = left.length; i >= 2; i--) {
        exp = `${exp}..\\`;
    }
    return exp;
}
