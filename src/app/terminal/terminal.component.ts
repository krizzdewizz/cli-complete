import { Component, OnInit, ElementRef, OnDestroy, HostListener, Output, EventEmitter, NgZone } from '@angular/core';
import { Terminal } from 'xterm';
import * as fit from 'xterm/lib/addons/fit/fit';
import * as winptyCompat from 'xterm/lib/addons/winptyCompat/winptyCompat';
import { TerminalService } from '@services/terminal.service';
import { TerminalSession, SessionInfo } from '@model/model';
import { Style } from '@style/style';
import { PromptService } from '@services/prompt.service';

const { clipboard } = window.require('electron');

Terminal.applyAddon(fit);
Terminal.applyAddon(winptyCompat);

@Component({
  selector: 'clic-terminal',
  templateUrl: './terminal.component.html',
  styleUrls: ['./terminal.component.scss']
})
export class TerminalComponent implements OnInit, OnDestroy {

  private awaitChunk: boolean;
  private _sessionInfo: SessionInfo;
  private term: Terminal;
  private session: TerminalSession;

  private fontSize = Style.fontSize;

  @Output() focusNextGroup = new EventEmitter<void>();
  @Output() pasteFromClipboard = new EventEmitter<void>();
  @Output() sessionInfo = new EventEmitter<SessionInfo>();

  constructor(private elRef: ElementRef, private termService: TerminalService, private zone: NgZone, private promptService: PromptService) {
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
    if (!e.ctrlKey) {
      return;
    }

    const increase = e.deltaY < 0;
    if (increase) {
      this.fontSize++;
    } else if (this.fontSize > 6) {
      this.fontSize--;
    }
    this.term.setOption('fontSize', this.fontSize);
    this.fit();
  }

  ngOnInit() {
    const term = this.term = new Terminal({
      fontFamily: Style.fontFamily,
      fontSize: this.fontSize,
      letterSpacing: Style.letterSpacing,
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
    session.onExit.subscribe(() => {
      this.zone.run(() => delete this.session);
    });
    session.onSessionInfo.subscribe(sessionInfo => {
      this._sessionInfo = sessionInfo;
      this.zone.run(() => this.sessionInfo.next(sessionInfo));
    });
    session.start();
  }

  private fit() {
    const term = this.term;
    (term as any).fit();
    this.session.resize(term.cols, term.rows);
  }

  ngOnDestroy() {
    this.session.destroy();
    delete this.session;
  }

  private onData(data: string) {
    this.term.write(data);
    this.term.scrollToBottom();

    this.autoAnswerTerminateBatchJobMessage(data);

    if (this.awaitChunk) {
      this.awaitChunk = false;
      this.promptService.promptMayChanged(this._sessionInfo);
    }
  }

  private autoAnswerTerminateBatchJobMessage(data: string) {
    const msg = 'Terminate batch job (Y/N)?';
    const pos = data.lastIndexOf('\n');
    const lastLine = pos >= 0 ? data.substring(pos).trim() : data;

    if (lastLine.includes(msg)) {
      this.send('y\r', false);
    }
  }

  send(data: string, clear = true) {
    this.awaitChunk = true;
    this.session.send(data);
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
