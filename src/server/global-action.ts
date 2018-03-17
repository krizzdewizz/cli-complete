import { globalShortcut } from 'electron';

const SELECT_TAB_X = [1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => ({
    id: `select-tab-${num}`,
    label: `Select Tab ${num}`,
    accelerator: `CmdOrCtrl+${num}`,
}));

const GLOBAL_ACTIONS = [
    ...SELECT_TAB_X,
    {
        id: 'new-terminal',
        label: 'New Terminal',
        accelerator: `CmdOrCtrl+T`,
    },
    {
        id: 'new-terminal',
        label: 'New Terminal',
        accelerator: `CmdOrCtrl+N`,
    },
    {
        id: 'close-terminal',
        label: 'Close Terminal',
        accelerator: `CmdOrCtrl+W`,
    }
];

export type ActionCallback = (id: string) => void;

let actionCallback: ActionCallback = () => undefined;
export function setGlobalActionCallback(cb: ActionCallback) {
    actionCallback = cb;
}

export function registerGlobalActions() {
    GLOBAL_ACTIONS.forEach(it => globalShortcut.register(it.accelerator, () => actionCallback(it.id)));
};
