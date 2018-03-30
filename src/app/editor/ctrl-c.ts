const DELAY = 300;

let firstTimer;

// empty selection -> breakk(). press twice within timeout to breakk(), else copyToClipboard()
export function handleCtrlC(selection: monaco.Range, breakk: () => void, copyToClipboard: () => void) {
    if (selection.isEmpty()) {
        breakk();
        return;
    }
    if (firstTimer) {
        clearTimeout(firstTimer);
        firstTimer = undefined;
        breakk();
    } else {
        firstTimer = setTimeout(() => {
            copyToClipboard();
            firstTimer = undefined;
        }, DELAY);
    }
}
