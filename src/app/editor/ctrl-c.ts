const DELAY = 300;

let firstTimer;

export function handleCtrlC(selection: monaco.Range, breakk: () => void, copyToClipboard: () => void) {
    breakk();
}

// empty selection -> breakk(). press twice within timeout to breakk(), else copyToClipboard()
function _handleCtrlC_double(selection: monaco.Range, breakk: () => void, copyToClipboard: () => void) {
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
