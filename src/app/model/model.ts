import { Observable } from 'rxjs/Observable';

export interface SessionConf {
    name?: string;
    shell: string; // cmd.exe
}

export interface TerminalSession {
    onData: Observable<string>;
    send(data: string);
    start();
    resize(cols: number, rows: number);
}
