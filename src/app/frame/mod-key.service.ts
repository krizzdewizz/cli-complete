import { EventEmitter, Injectable } from '@angular/core';

type NumpadKey = 'NumpadEnter' | 'NumpadAdd' | 'NumpadSubtract' | 'NumpadDivide';
const NUMPAD_KEYS = {
    NumpadEnter: true,
    NumpadAdd: true,
    NumpadSubtract: true,
    NumpadDivide: true
};

function hasModifier(e: KeyboardEvent): boolean {
    return e.shiftKey || e.altKey || e.ctrlKey;
}

const LONG_TIMEOUT = 500;
// on windows, pressing Alt+Tab will switch active window and app will not receive Alt Up event anymore
// solution is to fake press down after this timeout
const LONG_STAY_TIMEOUT = 1500;

type ModKey = 'Alt' | 'Control';

class ModKeyState {
    down = new EventEmitter<boolean>();
    downLong = new EventEmitter<boolean>();

    private isDown = false;
    private downLongTimer;
    private downLongStayTimer;

    handle(down: boolean): boolean {
        if (down === this.isDown) {
            return false;
        }

        this.isDown = down;
        this.down.emit(down);

        const emitLong = () => this.downLong.emit(down);

        if (down) {
            this.downLongTimer = setTimeout(emitLong, LONG_TIMEOUT);
            this.downLongStayTimer = setTimeout(() => this.handle(false), LONG_STAY_TIMEOUT);
        } else {
            clearTimeout(this.downLongTimer);
            clearTimeout(this.downLongStayTimer);
            this.downLongTimer = undefined;
            emitLong();
        }

        return true;
    }
}

@Injectable()
export class ModKeyService {

    get altDown(): EventEmitter<boolean> { return this.keyStates.Alt.down; }
    get altDownLong(): EventEmitter<boolean> { return this.keyStates.Alt.downLong; }

    get controlDown(): EventEmitter<boolean> { return this.keyStates.Control.down; }
    get controlDownLong(): EventEmitter<boolean> { return this.keyStates.Control.downLong; }

    numpad: (key: NumpadKey) => boolean;

    private keyStates = {
        Alt: new ModKeyState(),
        Control: new ModKeyState()
    };

    handleModKey(e: KeyboardEvent, down: boolean) {
        const numpad = NUMPAD_KEYS[e.code];
        if (down && numpad && this.numpad && !hasModifier(e)) {
            if (this.numpad(e.code as NumpadKey)) {
                e.cancelBubble = true;
                e.preventDefault();
            }
            return;
        }

        const modKey = e.key as ModKey;
        if (modKey !== 'Alt' && modKey !== 'Control') {
            return;
        }

        const keyState = this.keyStates[modKey];
        if (keyState.handle(down)) {
            e.cancelBubble = true;
            e.preventDefault();
        }
    }
}