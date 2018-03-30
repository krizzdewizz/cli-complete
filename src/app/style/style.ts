export interface Style {
    fontFamily?: string;
    fontSize?: number;
    letterSpacing?: number;
}

export function getEditorLineHeight(fontSize: number): number {
    return fontSize + 4;
}

export const DEFAULT_FONT_SIZE = 14;
export const EDITOR_LINE_HEIGHT = getEditorLineHeight(DEFAULT_FONT_SIZE);

export const Style: Style = {
    // fontFamily: 'Consolas',
    fontFamily: 'Fira Code',
    fontSize: DEFAULT_FONT_SIZE
};
