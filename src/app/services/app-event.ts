import { EventEmitter } from '@angular/core';

export const eventBus = {
    newTerminal: new EventEmitter<void>(),
    closeTerminal: new EventEmitter<HTMLElement>(),
};
