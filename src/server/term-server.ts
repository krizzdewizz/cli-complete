import { SessionConf } from '@model/model';
import * as child_process from 'child_process';
import * as stream from 'stream';
import { Subject } from 'rxjs/Subject';
import { spawn } from 'node-pty';
import { ITerminal } from 'node-pty/lib/interfaces';

export class TermSession {

    private dataSource = new Subject<string>();
    readonly dataChanged$ = this.dataSource.asObservable();

    private process: ITerminal;

    constructor(private conf: SessionConf) {
    }

    send(data: string) {
        this.process.write(data);
    }

    start() {
        this.process = spawn(this.conf.shell, [], {
            name: 'xterm-color',
            cols: 80,
            rows: 30,
            cwd: process.cwd(),
            env: process.env
        });

        this.process.on('data', data => {
            // console.log(data);
            this.dataSource.next(data);
        });
    }

    stop() {
        if (this.process) {
            this.process.kill();
            delete this.process;
        }
    }

    get running(): boolean {
        return Boolean(this.process);
    }
}
