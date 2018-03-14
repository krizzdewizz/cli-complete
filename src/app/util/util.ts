export function formatPath(path: string): string {
    return path.replace('\\', '/');
}

export interface Node {
    children?: Node[];
}

export function accept<T extends Node>(node: T, visitor: (node: T) => void) {
    visitor(node);
    const children = node.children;
    if (children) {
        children.forEach(it => accept(it, visitor));
    }
}
