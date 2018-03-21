import { Injectable } from '@angular/core';
import { accept } from '@util/util';
import { Settings, EditorSettings } from '@model/model';
import { EditorComponent } from '../editor/editor.component';
import { Subject } from 'rxjs';
import { EditorHistory } from '../editor/history';

const { remote } = window.require('electron');
const path = remote.require('path');
const fs = remote.require('fs');
const formatJson = remote.require('format-json');
const { homedir } = remote.require('./homedir');

export const EDITOR_COMPONENT = 'clic-editor';

const DEBUG = false;
// const DEBUG = true;

export function getContentItemEditor(it: GoldenLayout.ContentItem): EditorComponent {
  return it.container.compRef.instance;
}

export function getTabElement(it: GoldenLayout.ContentItem): JQuery {
  return it.container.tab.element;
}

export function setFocusedTabElement(it: GoldenLayout.ContentItem, focusEditor = true) {
  $('.lm_tab').removeClass('clic-focus');
  getTabElement(it).addClass('clic-focus');
  if (focusEditor) {
    getContentItemEditor(it).focus();
  }
}

function nextEditorId() {
  return `ed${Date.now()}`;
}

export function newEditor(): GoldenLayout.ComponentConfig {
  return {
    type: 'component',
    componentName: EDITOR_COMPONENT,
    title: '...',
    componentState: { editorId: nextEditorId() }
  };
}

export function forEachEditor(layout: GoldenLayoutX, cb: (ed: EditorComponent, contentItem?: GoldenLayout.ContentItem) => void) {
  accept(layout.root, it => {
    if (it.componentName === EDITOR_COMPONENT) {
      cb(getContentItemEditor(it), it);
    }
  });
}

function settingsDir(): string {
  return path.join(homedir(), '.cli-complete');
}

function settingsFile(): string {
  const dir = settingsDir();
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
  return path.join(dir, 'settings.json');
}

const DEFAULT_EDITOR = newEditor();
export const DEFAULT_LAYOUT: GoldenLayout.Config = {
  dimensions: {
    headerHeight: 22 // +2 for border-top
  },
  content: [{
    type: 'stack',
    content: [
      DEFAULT_EDITOR
    ]
  }],
  labels: {
    close: 'Close (Ctrl+W)',
    maximise: 'Maximize'
  }
};

export const DEFAULT_SETTINGS = {
  editors: { [DEFAULT_EDITOR.componentState.editorId]: { content: '' } },
  layout: DEFAULT_LAYOUT
};

@Injectable()
export class FrameService {

  settings: Settings = DEFAULT_SETTINGS;

  private saveTimer;
  private flash = new Subject<any>();
  private flash$ = this.flash.asObservable();

  constructor() {
    this.flash$
      .throttleTime(2000)
      .subscribe(({ pid, layout }) => {
        forEachEditor(layout, (ed, contentItem) => {
          if (ed.sessionInfo && ed.sessionInfo.pid === pid && ed.terminalCmp.writeDataToTerm) {
            const tabEl = getTabElement(contentItem);
            if (!tabEl.is('.lm_active')) {
              tabEl.addClass('clic-tab-flash');
              setTimeout(() => tabEl.removeClass('clic-tab-flash'), 1000);
            }
          }
        });
      });
  }

  saveSettingsThrottle(layout: GoldenLayoutX) {
    clearTimeout(this.saveTimer);
    this.saveTimer = setTimeout(() => this.saveSettings(layout), 2000);
  }

  autoexec(cb: (content: string) => void) {
    ['autoexec.cmd', 'autoexec.bat']
      .map(it => path.join(settingsDir(), it))
      .filter(it => fs.existsSync(it))
      .forEach(cmdFile => cb(String(fs.readFileSync(cmdFile))));
  }

  saveSettings(layout: GoldenLayoutX) {
    if (DEBUG) {
      return;
    }
    console.log('saving...');

    const cfg = layout.toConfig();
    Object.keys(cfg)
      .filter(key => key !== 'content')
      .forEach(key => delete cfg[key]);

    const editors: { [id: string]: EditorSettings; } = {};
    forEachEditor(layout, ed => {
      editors[ed.id] = {
        content: ed.content,
        cwd: ed.prompt.procInfo ? ed.prompt.procInfo.cwd : undefined,
        history: ed.info.history.list
      };
    });

    const all: Settings = {
      layout: cfg,
      editors
    };

    const home = settingsFile();
    try {
      fs.writeFileSync(home, formatJson.diffy(all));
    } catch (err) {
      console.error(`error while writing settings '${home}': ${err}`);
    }
  }

  loadSettings(): Settings {
    if (DEBUG) {
      return DEFAULT_SETTINGS;
    }
    const home = settingsFile();
    if (!fs.existsSync(home)) {
      return DEFAULT_SETTINGS;
    }

    try {
      let settings: Settings = JSON.parse(String(fs.readFileSync(home)));
      if (!settings.editors || Object.keys(settings.editors).length === 0) {
        settings = DEFAULT_SETTINGS;
      }
      settings.layout.labels = DEFAULT_LAYOUT.labels;
      settings.layout.dimensions = DEFAULT_LAYOUT.dimensions;
      return this.settings = settings;
    } catch (err) {
      console.error(`error while reading settings '${home}': ${err}`);
    }
  }

  loadEditorContent(layout: GoldenLayoutX) {
    const editors = this.settings.editors;
    forEachEditor(layout, ed => {
      const edSettings = editors[ed.id];
      if (edSettings) {
        ed.initialContent = edSettings.content;
        ed.initialCwd = edSettings.cwd;
        const history = edSettings.history || [];
        ed.initialHistory = history;
        if (ed.info) {
          ed.setHistory(new EditorHistory(history));
        }
      }
    });
  }

  flashInactiveTab(layout: GoldenLayoutX, pid: number) {
    this.flash.next({ layout, pid });
  }
}
