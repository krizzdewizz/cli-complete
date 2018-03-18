import { appEvent } from '@services/app-event';

function keyToAccel(e: KeyboardEvent): string {
    let accel = '';
    if (e.ctrlKey) {
        accel += 'cmd';
        accel += '+';
    }
    if (e.altKey) {
        accel += 'alt';
        accel += '+';
    }
    if (e.shiftKey) {
        accel += 'shift';
        accel += '+';
    }
    accel += e.code;
    return accel.toLowerCase();
}

interface Actions {
    [accel: string]: () => void;
}

const actions: Actions = {
    'cmd+keyt': () => appEvent.newTerminal.next(),
    'cmd+keyw': () => appEvent.closeTerminal.next()
};

[1, 2, 3, 4, 5, 6, 7, 8, 9].forEach(num => actions[`cmd+digit${num}`] = () => appEvent.selectTab.next(num));

export function registerKeyboardActions() {
    window.addEventListener('keydown', e => {
        const accel = keyToAccel(e);
        const action = actions[accel];
        // console.log('keydown', accel, action);
        if (action) {
            action();
            e.preventDefault();
            e.stopPropagation();
            e.cancelBubble = true;
        }
    }, true);
}
