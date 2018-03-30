import { Injectable } from '@angular/core';
import { accept } from '@util/util';
import { Settings, EditorSettings } from '@model/model';
import { EditorComponent } from '../editor/editor.component';
import { Subject } from 'rxjs';
import { EditorHistory } from '../editor/history';

const { remote } = window.require('electron');
const { settingsDir, saveSettings, loadSettings } = remote.require('./settings');
const path = remote.require('path');
const fs = remote.require('fs');

export const EDITOR_COMPONENT = 'clic-editor';

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

export function newEditor({ initialCwd }: { initialCwd?: string } = {}): GoldenLayout.ComponentConfig {
  return {
    type: 'component',
    componentName: EDITOR_COMPONENT,
    title: '...',
    componentState: { editorId: nextEditorId(), initialCwd }
  };
}

export function forEachEditor(layout: GoldenLayoutX, cb: (ed: EditorComponent, contentItem?: GoldenLayout.ContentItem) => void) {
  accept(layout.root, it => {
    if (it.componentName === EDITOR_COMPONENT) {
      cb(getContentItemEditor(it), it);
    }
  });
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
    close: 'Close',
    maximise: 'Maximize'
  }
};

export const DEFAULT_SETTINGS = {
  editors: { [DEFAULT_EDITOR.componentState.editorId]: { content: '' } },
  layout: DEFAULT_LAYOUT
};

const SETTINGS_FILE = 'settings.json';

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
    this.saveTimer = setTimeout(() => this.saveSettings(layout), 1000);
  }

  autoexec(cb: (content: string) => void) {
    ['autoexec.cmd', 'autoexec.bat']
      .map(it => path.join(settingsDir(), it))
      .filter(it => fs.existsSync(it))
      .forEach(cmdFile => cb(String(fs.readFileSync(cmdFile))));
  }

  saveSettings(layout: GoldenLayoutX) {
    const cfg = layout.toConfig();
    Object.keys(cfg)
      .filter(key => key !== 'content')
      .forEach(key => delete cfg[key]);

    accept(cfg, it => {
      if (it.componentName === EDITOR_COMPONENT) {
        delete it.componentState.initialCwd;
      }
    });

    const editors: { [id: string]: EditorSettings; } = {};
    forEachEditor(layout, ed => {
      editors[ed.id] = {
        content: ed.content,
        cwd: ed.prompt.params && ed.prompt.params.procInfo ? ed.prompt.params.procInfo.cwd : undefined,
        history: ed.info.history.list,
        fontSize: ed.fontSize
      };
    });

    const all: Settings = {
      layout: cfg,
      editors
    };

    saveSettings(SETTINGS_FILE, all);
  }

  loadSettings(): Settings {
    let settings = loadSettings(SETTINGS_FILE, DEFAULT_SETTINGS);
    if (!settings.editors || Object.keys(settings.editors).length === 0) {
      settings = DEFAULT_SETTINGS;
    }
    settings.layout.labels = DEFAULT_LAYOUT.labels;
    settings.layout.dimensions = DEFAULT_LAYOUT.dimensions;
    return this.settings = settings;
  }

  loadEditorSettings(layout: GoldenLayoutX) {
    const editors = this.settings.editors;
    forEachEditor(layout, ed => {
      const edSettings = editors[ed.id];
      if (edSettings) {
        ed.initialContent = edSettings.content;
        ed.initialCwd = edSettings.cwd;
        ed.initialFontSize = edSettings.fontSize;
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
