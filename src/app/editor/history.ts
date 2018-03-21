import { EventEmitter } from '@angular/core';

export const CACHE_MAX = 30;

export class EditorHistory {
    select = new EventEmitter<string>();

    private readonly cache = new LRUCache<string>(CACHE_MAX, Number.POSITIVE_INFINITY);
    private index = 0;

    constructor(list: string[] = []) {
        list.forEach((it, index) => this.cache.set(String(index), it));
        this.index = list.length - 1;
    }

    push(s: string) {
        const list = this.list;
        const len = list.length;
        if (list[list.length - 1] === s) {
            return;
        }
        this.cache.set(String(len), s);
        this.index = len;
    }

    prev() {
        if (this.index > 0) {
            this.index--;
            this.emitCurrent();
        }
    }

    next() {
        if (this.index + 1 < this.list.length) {
            this.index++;
            this.emitCurrent();
        }
    }

    get list(): string[] {
        return this.cache.values();
    }

    private emitCurrent() {
        this.select.next(this.list[this.index]);
    }
}