const DELAY = 300;

export async function waitForMonaco() {
    const check = () => {
        if ((window as any).monaco) {
            return true;
        } else {
            console.log('ttttttttttttttttttttttt');

            setTimeout(check, DELAY);
        }
    };

    setTimeout(check, DELAY);
}
