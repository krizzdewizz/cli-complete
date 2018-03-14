// Terminate batch job (Y/N)?

const promptPattern = /.*\((.)\/.\)\?/;

export function autoAnswerYes(data: string, yes: (yesKey: string) => void) {
    const pos = data.lastIndexOf('\n');
    const lastLine = pos >= 0 ? data.substring(pos).trim() : data;
    const match = lastLine.match(promptPattern);
    if (match) {
        yes(match[1]);
    }
}
