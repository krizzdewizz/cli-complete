import * as path from 'path';
import * as fs from 'fs';
import { settingsDir } from './settings';
import { isDev } from './dev';

let plugins: any[];

const reloadPlugins = isDev();

const reload = reloadPlugins ? require('require-nocache')(module) : require;

export async function loadPlugins() {

    if (plugins && !reloadPlugins) {
        return true;
    }

    console.log('load plugins...');

    const pluginsDir = path.join(settingsDir(), 'plugins');

    if (!fs.existsSync(pluginsDir)) {
        return true;
    }

    const all = await fs.readdirSync(pluginsDir);
    plugins = all
        .map(it => {
            const pluginDir = path.join(pluginsDir, it);
            const packFile = path.join(pluginDir, 'package.json');
            if (!fs.existsSync(packFile)) {
                return;
            }
            const { main } = require(packFile);
            if (!main) {
                return;
            }

            const mainFull = path.join(pluginDir, main);
            try {
                return reload(mainFull);
            } catch (err) {
                console.error(`error while loading plugin '${mainFull}': `, err);
            }
        })
        .filter(Boolean);

    return true;
}

export async function formatPrompt(params): Promise<string> {
    if (reloadPlugins) {
        await loadPlugins();
    }
    const formatter = plugins
        .map(it => it.formatPrompt)
        .find(Boolean);
    return formatter ? formatter(params) : '';
}
