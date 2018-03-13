import * as windowsProcessTree from './windows-process-tree/lib';

export function processTree(pid: number): Promise<any> {
    return new Promise(resolve => {
        windowsProcessTree(pid, tree => {
            resolve(tree);
        });
    });
}
