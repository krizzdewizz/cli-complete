import { EventEmitter } from '@angular/core';

export class EditorHistory {
    select = new EventEmitter<string>();

    private list: string[] = [];
    private index = 0;

    push(...it: string[]) {
        this.list.push(...it);
        this.index = this.list.length - 1;
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

    private emitCurrent() {
        this.select.next(this.list[this.index]);
    }
}