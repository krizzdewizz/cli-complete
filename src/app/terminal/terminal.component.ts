import { Component, OnInit, ElementRef, OnDestroy, HostListener, Output, EventEmitter, NgZone, Input } from '@angular/core';
import { Terminal } from 'xterm';
import * as fit from 'xterm/lib/addons/fit/fit';
import * as winptyCompat from 'xterm/lib/addons/winptyCompat/winptyCompat';
import { TerminalService } from '@services/terminal.service';
import { TerminalSession, SessionInfo } from '@model/model';
import { Style } from '@style/style';
import { PromptService } from '@services/prompt.service';
import { autoAnswerYes } from './auto-answer-yes';
import { FontSizeWheelService } from '@services/font-size-wheel.service';
import { mapInternalCommand } from './internal-command';
import { appEvent } from '@services/app-event';
import { ISubscription } from 'rxjs/Subscription';

const { clipboard, remote } = window.require('electron');

const { processEnv } = remote.require('./term-server');

Terminal.applyAddon(fit);
Terminal.applyAddon(winptyCompat);

@Component({
  selector: 'clic-terminal',
  template: '',
  styleUrls: ['./terminal.component.scss']
})
export class TerminalComponent implements OnInit, OnDestroy {

  // getProcessInfo() may be faster than send(), resulting in the wrong cwd -> determine cwd after first chunk arrives from terminal
  private awaitChunk: boolean;
  writeDataToTerm: boolean;
  _sessionInfo: SessionInfo;
  private term: Terminal;
  private session: TerminalSession;
  private subscriptions: ISubscription[];

  private style = { ...Style };

  @Input() cwd: string;

  @Output() focusNextGroup = new EventEmitter<void>();
  @Output() pasteFromClipboard = new EventEmitter<void>();
  @Output() sessionInfo = new EventEmitter<SessionInfo>();

  constructor(
    private elRef: ElementRef,
    private termService: TerminalService,
    private zone: NgZone,
    private promptService: PromptService,
    private fontSizeWheelService: FontSizeWheelService) {
  }

  @HostListener('mouseup', ['$event'])
  onMouseUp(e: MouseEvent) {
    const term = this.term;
    if (e.button === 0 && term.hasSelection()) {
      clipboard.writeText(term.getSelection());
      term.clearSelection();
      return false;
    } else if (e.button === 2) {
      this.pasteFromClipboard.next();
      return false;
    }
  }

  setFontSize(fontSize: number) {
    this.term.setOption('fontSize', this.style.fontSize = fontSize);
    this.fit();
  }

  ngOnInit() {
    this.subscriptions = [
      appEvent.resize.subscribe(() => this.fit())
    ];

    const term = this.term = new Terminal({
      ...this.style,
      theme: {
        background: '#1e1e1e',
        foreground: '#dddddd'
      }
    });

    (term as any).winptyCompatInit();

    // 'native' command line
    term.on('data', data => this.session.send(data));
    term.on('focus', () => this.writeDataToTerm = true);

    term.attachCustomKeyEventHandler(e => {
      if (e.key === 'F6') {
        this.focusNextGroup.next();
        return false;
      }
    });

    setTimeout(() => {
      term.open(this.elRef.nativeElement);
      // Ensure new processes' output starts at start of new line
      // this.term.write('\n\x1b[G');

      this.fit();
    });

    this.startSessionInternal();
  }

  startSession() {
    this.zone.run(() => this.startSessionInternal());
  }

  private startSessionInternal() {
    if (this.session) {
      return;
    }
    const env = processEnv();
    const shell = env.comspec || 'c:\\windows\\system32\\cmd.exe';
    // const shell = 'D:\\prg\\git\\git-bash.exe';
    // const shell = 'D:\\prg\\tcc\\tcc.exe';
    const session = this.session = this.termService.newSession({
      shell,
      cwd: this.cwd
    });
    session.onData.subscribe(data => this.onData(data));
    session.onExit.subscribe(() => this.zone.run(() => {
      this.promptService.clearPrompt(this._sessionInfo);
      delete this.session;
      delete this._sessionInfo;
    }));
    session.onSessionInfo.subscribe(sessionInfo => {
      this._sessionInfo = sessionInfo;
      this.zone.run(() => this.sessionInfo.next(sessionInfo));
    });
    session.start();
  }

  private fit() {
    const term = this.term;
    (term as any).fit();
    if (this.session) {
      this.session.resize(term.cols, term.rows);
    }
  }

  ngOnDestroy() {
    this.subscriptions.forEach(it => it.unsubscribe());
    if (this.session) {
      this.session.destroy();
      delete this.session;
    }
  }

  private onData(data: string) {

    if (this.awaitChunk) {
      this.awaitChunk = false;
      this.promptService.promptMayChanged(this._sessionInfo);
    }

    appEvent.sessionData.next(this._sessionInfo.pid);

    if (this.writeDataToTerm) {
      this.term.write(data);
      this.term.scrollToBottom();
    }

    autoAnswerYes(data, yesKey => this.send(`${yesKey}\r`, false));

  }

  send(data: string, clear = true, writeDataToTerm = true) {
    if (writeDataToTerm) {
      this.writeDataToTerm = true;
    }
    this.awaitChunk = true;
    this.session.send(mapInternalCommand(data));
    if (clear) {
      this.term.clear();
    }
  }

  focus() {
    this.term.focus();
  }

  get hasSession(): boolean {
    return Boolean(this.session);
  }
}
