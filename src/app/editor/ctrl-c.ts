const DELAY = 300;

let firstTimer;

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
