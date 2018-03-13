import * as path from 'path';
import * as child_process from 'child_process';

type Subscriber = (s?: string) => void;

const SERVER = path.join(__dirname, 'getcwd/x64/Release/getcwd');

export class CwdServer {

    static readonly INSTANCE = new CwdServer();

    private srv: child_process.ChildProcess;
    private subscribers: Subscriber[] = [];
    private cwds: { [pid: number]: string } = {};

    onError: (err: Error) => void = () => undefined;

    cwdMayChanged(pid: number) {
        delete this.cwds[pid];
    }

    async getCwd(pid: number): Promise<string> {
        const cwd = this.cwds[pid];
        if (cwd) {
            return cwd;
        }
        return this.request(pid).then(wd => this.cwds[pid] = wd);
    }

    private writeRequest(req: string) {
        // console.log('wwwww reqqq', req);
        this.srv.stdin.write(`${req}\n`);
    }

    init(): boolean {
        if (this.srv) {
            return true;
        }

        try {
            const srv = child_process.spawn(SERVER);

            let all = '';
            srv.stdout.on('data', data => {
                all += String(data);
                if (all.endsWith('\n')) {
                    // DEBUG_LOG('ret', all);
                    const response = all;
                    all = '';
                    // const time = Date.now() - this.reqStart;
                    // console.log('req time', time);

                    const s = this.subscribers[0];
                    this.subscribers = this.subscribers.slice(1);

                    try {
                        if (s) {
                            s(response);
                        } else {
                            console.warn(`no subscriber for response.`);
                        }
                    } catch (err) {
                        this.onError(err);
                    }
                }
            });

            srv.on('error', this.onError);

            srv.on('exit', () => {
                // DEBUG_LOG('splserver exited.')
                this.srv = undefined;
            });

            // DEBUG_LOG('splserver started.')

            this.srv = srv;

            return true;
        } catch (err) {
            this.onError(err);
        }

        return false;
    }

    reqStart;

    private async request(pid: number): Promise<string> {

        if (!this.init()) {
            return Promise.resolve('');
        }

        return new Promise<string>(s => {
            this.subscribers.push(s);
            this.reqStart = Date.now();
            this.writeRequest(String(pid));
        });
    }

    destroy() {
        if (!this.srv) {
            return;
        }
        this.writeRequest('');
    }
}
