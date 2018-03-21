import { Subject } from './modules';
import { SessionConf, TerminalSession, SessionInfo } from '@model/model';
import { processKilled } from './process-info';
import * as fs from 'fs';
import { spawn } from 'node-pty-prebuilt';
import { ITerminal } from 'node-pty-prebuilt/lib/interfaces';

export function processEnv() {
    return process.env;
}

export class TermSession implements TerminalSession {

    private dataSource = new Subject<string>();
    readonly onData = this.dataSource.asObservable();

    private exitSource = new Subject<string>();
    readonly onExit = this.exitSource.asObservable();

    private sessionInfoSource = new Subject<SessionInfo>();
    readonly onSessionInfo = this.sessionInfoSource.asObservable();

    private process: ITerminal;

    constructor(private conf: SessionConf) {
    }

    send(data: string) {
        this.process.write(data);
    }

    start() {

        const confCwd = this.conf.cwd;
        const cwd = confCwd && fs.existsSync(confCwd) ? confCwd : process.cwd();

        this.process = spawn(this.conf.shell, [], {
            name: 'clic-xterm',
            cols: 80,
            rows: 30,
            cwd,
            env: process.env
        });

        this.process.on('data', data => this.dataSource.next(data));
        this.process.on('exit', () => this.exitSource.next());
        this.sessionInfoSource.next({
            title: this.process.process,
            pid: this.process.pid,
            env: process.env
        });
    }

    resize(cols: number, rows: number) {
        if (this.process) {
            this.process.resize(cols, rows);
        }
    }

    destroy() {
        if (this.process) {
            processKilled(this.process.pid);
            this.process.destroy();
            delete this.process;
        }
    }

    get running(): boolean {
        return Boolean(this.process);
    }
}
