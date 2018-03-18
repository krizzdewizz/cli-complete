import { EventEmitter } from '@angular/core';

export const appEvent = {
    newTerminal: new EventEmitter<void>(),
    closeTerminal: new EventEmitter<void>(),
    selectTab: new EventEmitter<number>(),
    pipeToQEditor: new EventEmitter<HTMLElement>(),
    layout: new EventEmitter<HTMLElement>(),
    saveLayout: new EventEmitter<HTMLElement>(),
    saveLayoutAuto: new EventEmitter<HTMLElement>(),
    sessionData: new EventEmitter<number>(), // pid
    focusEditor: new EventEmitter<string>() // id
};
