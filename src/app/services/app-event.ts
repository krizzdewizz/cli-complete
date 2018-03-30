import { EventEmitter } from '@angular/core';
import { EditorComponent } from '../editor/editor.component';

export const appEvent = {
    newTerminal: new EventEmitter<GoldenLayout.ContentItem>(), // optional stack
    closeTerminal: new EventEmitter<void>(),
    selectTab: new EventEmitter<number>(),
    pipeToQEditor: new EventEmitter<HTMLElement>(),
    layout: new EventEmitter<HTMLElement>(),
    saveLayout: new EventEmitter<HTMLElement>(),
    saveLayoutAuto: new EventEmitter<HTMLElement>(),
    sessionData: new EventEmitter<number>(), // pid
    focusEditor: new EventEmitter<EditorComponent>(),
    splitEditor: new EventEmitter<void>(),
};
