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
    let result;
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
    let result;
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
