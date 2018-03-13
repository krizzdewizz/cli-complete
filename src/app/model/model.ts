import { Observable } from 'rxjs/Observable';

export interface SessionConf {
    name?: string;
    shell: string; // cmd.exe
}

export interface SessionInfo {
    title: string;
    pid: number;
    cwd: () => string;
    env: { [key: string]: string };
}

export interface TerminalSession {
    onData: Observable<string>;
    onExit: Observable<string>;
    onSessionInfo: Observable<SessionInfo>;
    send(data: string);
    start();
    resize(cols: number, rows: number);
    destroy();
}
