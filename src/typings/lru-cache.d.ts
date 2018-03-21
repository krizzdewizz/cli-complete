// typings for https://github.com/viruschidai/lru-cache

declare class LRUCache<V> {
    constructor(capacity?: number, maxAge?: number);

    get(key: string): V;
    set(key: string, value: V);

    keys(): string[];
    values(): V[];
    remove(key: string): number;
    has(key: string): boolean;
    reset(): void;
}