const DELAY = 200;

export function waitForMonaco() {
    return new Promise((resolve, reject) => {
        let tries = 20;

        const check = () => {
            if ((window as any).monaco) {
                resolve();
            } else if (tries > 0) {
                tries--;
                setTimeout(check, DELAY);
            } else {
                reject('waitForMonaco timed out.');
            }
        };

        setTimeout(check, DELAY);
    });

}
