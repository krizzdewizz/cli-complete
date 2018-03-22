// import * as windowsProcessInfo from './windows-process-info/lib';
const windowsProcessInfo = require('./windows-process-info');

export interface ProcessInfo {
    cwd?: string;
    title?: string;
    commandLine?: string;
}

function formatCwd(cwd: string) {
    if (!cwd) {
        return '';
    }
    return cwd.length === 1 ? `${cwd}:\\` : cwd; // windows. If at root, getProcessInfo() says: 'C' or 'D' drive
}

const infos: { [pid: number]: ProcessInfo } = {};

export function processInfoMayChanged(pid: number) {
    delete infos[pid];
}

export function processKilled(pid: number) {
    delete infos[pid];
}

export async function getProcessInfo(pid: number): Promise<ProcessInfo> {
    const cwd = infos[pid];
    if (cwd) {
        return cwd;
    }

    return new Promise(resolve => {
        windowsProcessInfo(pid, info => {
            info.cwd = formatCwd(info.cwd);
            resolve(info);
        });
    });
}
