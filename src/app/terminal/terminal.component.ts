import { Component, OnInit, ElementRef, OnDestroy, HostListener, Output, EventEmitter, NgZone } from '@angular/core';
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

const { clipboard } = window.require('electron');

Terminal.applyAddon(fit);
Terminal.applyAddon(winptyCompat);

@Component({
  selector: 'clic-terminal',
  template: '',
  styleUrls: ['./terminal.component.scss']
})
export class TerminalComponent implements OnInit, OnDestroy {

  // cwd-server may be faster than send(), resulting in the wrong cwd -> determine cwd after first chunk arrives from terminal
  private awaitChunk: boolean;
  private _sessionInfo: SessionInfo;
  private term: Terminal;
  private session: TerminalSession;

  private style = { ...Style };

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

  @HostListener('wheel', ['$event'])
  onWheel(e: MouseWheelEvent) {
    if (this.fontSizeWheelService.onWheel(this.style, e)) {
      this.term.setOption('fontSize', this.style.fontSize);
      this.fit();
    }
  }

  ngOnInit() {
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

    window.addEventListener('resize', () => this.fit());

    this.startSessionInternal();
  }

  startSession() {
    this.zone.run(() => this.startSessionInternal());
  }

  private startSessionInternal() {
    if (this.session) {
      return;
    }
    const session = this.session = this.termService.newSession({ shell: 'c:\\windows\\system32\\cmd.exe' });
    session.onData.subscribe(data => this.onData(data));
    session.onExit.subscribe(() => this.zone.run(() => delete this.session));
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
    this.session.destroy();
    delete this.session;
  }

  private onData(data: string) {
    this.term.write(data);
    this.term.scrollToBottom();

    autoAnswerYes(data, yesKey => this.send(`${yesKey}\r`, false));

    if (this.awaitChunk) {
      this.awaitChunk = false;
      this.promptService.promptMayChanged(this._sessionInfo);
    }
  }

  send(data: string, clear = true) {
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
