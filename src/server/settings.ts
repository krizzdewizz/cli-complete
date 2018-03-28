const path = require('path');
const fs = require('fs');
const formatJson = require('format-json');
const { homedir } = require('./homedir');
import { config } from './config';

export function settingsDir(): string {
    const home = config.dev ? path.resolve(__dirname, '..', '..') : homedir();
    return path.join(home, '.cli-complete');
}

export function settingsFile(name: string): string {
    const dir = settingsDir();
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }
    return path.join(dir, name);
}

export function saveSettings<T>(name: string, settings: T) {
    const home = settingsFile(name);
    try {
        fs.writeFileSync(home, formatJson.diffy(settings));
    } catch (err) {
        console.error(`error while writing settings '${home}': ${err}`);
    }
}

export function loadSettings<T>(name: string, def: T): T {
    const file = settingsFile(name);
    if (!fs.existsSync(file)) {
        return def;
    }

    try {
        return JSON.parse(String(fs.readFileSync(file)));
    } catch (err) {
        console.error(`error while reading settings '${file}': ${err}`);
    }
}
