import { parsePathPrefix, explodeRelPath } from '@util/util';

export function mapInternalCommand(cmd: string): string {
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
        return `md ${path}&cd ${path}\r`;
    }

    // autocd
    if (cmd.trimRight().endsWith('\\') && !parsePathPrefix(cmd).hadSpace) {
        cmd = `cd ${explodeRelPath(cmd)}\r`;
    }

    return cmd;
}