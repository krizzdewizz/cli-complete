import { ProcessInfo } from '@server/process-info';
const { remote } = window.require('electron');
const { getProcessInfo } = remote.require('./process-info');
const fs = remote.require('fs');
const path = remote.require('path');

export interface FileSystem {
    processInfo(pid: number): Promise<ProcessInfo>;
    readDir(path: string): Promise<string[]>;
    isDirectory(path: string): Promise<boolean>;
    join(...path: string[]): string;
    dirname(path: string): string;
}

export const FS: FileSystem = {
    processInfo(pid: number) {
        return getProcessInfo(pid);
    },

    readDir(p: string) {
        return new Promise((resolve, reject) => {
            fs.readdir(p, (err, files) => {
                if (err) {
                    return resolve([]);
                }
                return resolve(files);
            });
        });
    },

    isDirectory(p: string) {
        return new Promise((resolve, reject) => {
            fs.lstat(p, (err, stat) => {
                if (err) {
                    return resolve();
                }
                return resolve(stat.isDirectory());
            });
        });
    },

    join(...p: string[]) {
        return path.join(...p);
    },

    dirname(p: string) {
        return path.dirname(p);
    }
};
