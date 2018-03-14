import { EventEmitter } from '@angular/core';

export const appEvent = {
    newTerminal: new EventEmitter<void>(),
    closeTerminal: new EventEmitter<HTMLElement>(),
    layout: new EventEmitter<HTMLElement>(),
};
