import { parsePathPrefix, explodeRelPath } from '@util/util';
import { getAlias } from './alias';

export function mapInternalCommand(cmd: string): string {

    cmd = getAlias(cmd);

    const cdd = 'cdd ';
    if (cmd.startsWith(cdd)) {
        const path = cmd.substring(cdd.length).trimLeft();
        if (path[1] === ':') {
            const changeDrive = path.substr(0, 2);
            const p = path.substring(2);
            return `${changeDrive}&cd ${p}`;
        }
    }

    const mcd = 'mcd';
    if (cmd.startsWith(mcd)) {
        const path = cmd.substring(mcd.length).trim();
        return `md ${path}&cd ${path}`;
    }

    // autocd
    if (cmd.trimRight().endsWith('\\') && !parsePathPrefix(cmd).hadSpace) {
        cmd = `cd ${explodeRelPath(cmd)}`;
    }

    return cmd;
}