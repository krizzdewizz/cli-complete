export function createMenu(dev: boolean): Electron.MenuItemConstructorOptions[] {
    const menu: Electron.MenuItemConstructorOptions[] = [
        {
            label: 'Reload',
            accelerator: 'CmdOrCtrl+R',
            click(_item, focusedWindow) {
                if (focusedWindow) {
                    focusedWindow.reload();
                }
            }
        }
    ];

    if (!dev) {
        // conflicts with Chrome debugger step-into
        menu.push({
            label: 'Fullscreen',
            role: 'togglefullscreen',
        });
    }

    return menu;
}
