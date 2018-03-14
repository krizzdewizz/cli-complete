import { EventEmitter } from '@angular/core';

export class EditorHistory {
    select = new EventEmitter<string>();

    private _list: string[] = [];
    get list(): string[] {
        return this._list;
    }
    private index = 0;

    push(s: string) {
        const list = this.list;
        if (list[list.length - 1] === s) {
            return;
        }
        list.push(s);
        this.index = list.length - 1;
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