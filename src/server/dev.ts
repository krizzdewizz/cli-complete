import { config } from './config';

export function isDev(): boolean {
    return config.dev || process.argv.indexOf('-dev') >= 0;
}
