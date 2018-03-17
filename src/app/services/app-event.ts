import { EventEmitter } from '@angular/core';

export const appEvent = {
    newTerminal: new EventEmitter<void>(),
    pipeToQEditor: new EventEmitter<HTMLElement>(),
    layout: new EventEmitter<HTMLElement>(),
    saveLayout: new EventEmitter<HTMLElement>(),
    saveLayoutAuto: new EventEmitter<HTMLElement>(),
};
