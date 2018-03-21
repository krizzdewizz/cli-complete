import { EditorHistory } from './history';
import { SessionInfo } from '@model/model';

export const enum Suggest {
    HISTORY, DIR
}

export interface EditorInfo {
    history: EditorHistory;
    sessionInfo?: SessionInfo;
    suggest?: Suggest;
};

const editors: { [editorId: string]: EditorInfo } = {};

export function addEditor(id: string, history: string[]): EditorInfo {
    return editors[id] = { history: new EditorHistory(history), suggest: Suggest.HISTORY };
}

export function getEditor(id: string): EditorInfo {
    return editors[id];
}

export function deleteEditor(id: string): void {
    delete editors[id];
}

