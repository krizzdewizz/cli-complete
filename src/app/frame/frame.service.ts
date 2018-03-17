import { Injectable } from '@angular/core';
import { accept } from '@util/util';
import { Settings, EditorSettings } from '@model/model';
import { EditorComponent } from '../editor/editor.component';

const { remote } = window.require('electron');
const path = remote.require('path');
const fs = remote.require('fs');
const formatJson = remote.require('format-json');
const { homedir } = remote.require('./homedir');

export function getContentItemEditor(it: GoldenLayout.ContentItem): EditorComponent {
  return (it as any).container.compRef.instance;
}

function nextId() {
  return `ed${Date.now()}`;
}

export function newEditor(): GoldenLayout.ComponentConfig {
  return {
    type: 'component',
    componentName: 'clic-editor',
    componentState: { clicId: nextId() }
  };
}

export function forEachEditor(layout: GoldenLayoutX, cb: (clicId: string, ed: EditorComponent) => void) {
  accept(layout.root, (it: any) => {
    if (it.componentName === 'clic-editor') {
      const clicId = it.container.getState().clicId;
      const ed = getContentItemEditor(it);
      cb(clicId, ed);
    }
  });
}

const SETTINGS_FILE = '.cli-complete.json';

function homeFile(): string {
  return path.join(homedir(), SETTINGS_FILE);
}

const DEFAULT_EDITOR = newEditor();
export const DEFAULT_LAYOUT: GoldenLayout.Config = {
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
  editors: { [DEFAULT_EDITOR.componentState.clicId]: { content: '' } },
  layout: DEFAULT_LAYOUT
};

@Injectable()
export class FrameService {

  settings: Settings = DEFAULT_SETTINGS;

  private saveTimer;

  constructor() { }

  saveSettingsThrottle(layout: GoldenLayoutX) {
    clearTimeout(this.saveTimer);
    this.saveTimer = setTimeout(() => this.saveSettings(layout), 2000);
  }

  saveSettings(layout: GoldenLayoutX) {
    console.log('saving...');

    const cfg = layout.toConfig();
    delete cfg.labels;

    const editors: { [id: string]: EditorSettings; } = {};
    const all: Settings = {
      layout: cfg,
      editors
    };

    forEachEditor(layout, (clicId, ed) => editors[clicId] = { content: ed.content });

    const home = homeFile();
    try {
      fs.writeFileSync(home, formatJson.diffy(all));
    } catch (err) {
      console.error(`error while writing settings '${home}': ${err}`);
    }
  }

  loadSettings(): Settings {
    const home = homeFile();
    if (!fs.existsSync(home)) {
      return DEFAULT_SETTINGS;
    }

    try {
      let settings: Settings = JSON.parse(String(fs.readFileSync(home)));
      if (!settings.editors || Object.keys(settings.editors).length === 0) {
        settings = DEFAULT_SETTINGS;
      }
      settings.layout.labels = DEFAULT_LAYOUT.labels;
      return this.settings = settings;
    } catch (err) {
      console.error(`error while reading settings '${home}': ${err}`);
    }
  }

  loadEditorContent(layout: GoldenLayoutX) {
    const editors = this.settings.editors;
    forEachEditor(layout, (clicId, ed) => {
      const edSettings = editors[clicId];
      if (edSettings) {
        ed.content = edSettings.content;
      }
    });
  }
}
