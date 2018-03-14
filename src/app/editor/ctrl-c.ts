const DELAY = 300;

let firstTimer;

// press twice within timeout to break, else copyToClipboard
export function handleCtrlC(breakk: () => void, copyToClipboard: () => void) {
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
