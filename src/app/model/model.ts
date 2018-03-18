import { Observable } from 'rxjs/Observable';

export interface SessionConf {
    name?: string;
    shell: string; // cmd.exe
    cwd?: string;
}

export interface SessionInfo {
    title: string;
    pid: number;
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

export interface EditorSettings {
    content: string;
    cwd?: string;
}

export interface Settings {
    layout: any; // GoldenLayout config
    editors: { [id: string]: EditorSettings; };
};
