const { remote } = window.require('electron');
const fs = remote.require('fs');
const { settingsFile } = remote.require('./settings');

let aliases: { [name: string]: string };

export function getAlias(cmd: string): string {
    if (!aliases) {
        return cmd;
    }

    let al = aliases[cmd];
    if (al) {
        return al;
    }

    const pos = cmd.indexOf(' ');
    if (pos < 0) {
        return cmd;
    }

    const prefix = cmd.substring(0, pos);
    al = aliases[prefix];
    if (al) {
        return `${al}${cmd.substring(pos)}`;
    }

    return cmd;
}

export function loadAlias() {
    if (aliases) {
        return; // already loaded
    }

    aliases = {};

    const file = settingsFile('alias');
    if (!fs.existsSync(file)) {
        return;
    }

    const load = () => {

        aliases = {};

        if (!fs.existsSync(file)) {
            return;
        }

        String(fs.readFileSync(file))
            .split(/\n/)
            .map(line => line.trim())
            .filter(Boolean)
            .forEach(line => {
                const pos = line.indexOf('=');
                if (pos >= 0) {
                    aliases[line.substring(0, pos)] = line.substring(pos + 1);
                }
            });
    };

    let watchTimer;
    fs.watch(file, (eventType, filename) => {
        clearTimeout(watchTimer);
        watchTimer = setTimeout(load, 300);
    });

    load();
}
