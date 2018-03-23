import { Component, OnInit, ElementRef, ViewChild, ViewContainerRef, ComponentFactoryResolver, OnDestroy, Type, HostBinding } from '@angular/core';
import { EditorComponent } from '../editor/editor.component';
import { Subscription } from 'rxjs/Subscription';
import { appEvent } from '@services/app-event';
import { findAncestor, accept } from '@util/util';
import { FrameService, newEditor, getContentItemEditor, DEFAULT_LAYOUT, setFocusedTabElement, forEachEditor, getTabElement, EDITOR_COMPONENT } from './frame.service';
import { registerKeyboardActions } from './keyboard';
import { ModKeyService } from './mod-key.service';

@Component({
  selector: 'clic-frame',
  templateUrl: './frame.component.html',
  styleUrls: ['./frame.component.scss']
})
export class FrameComponent implements OnInit, OnDestroy {
  private layout: GoldenLayoutX;
  private subscriptions: Subscription[];
  private lastFocusEditorId: string;

  @ViewChild('layoutContainer') layoutContainer: ElementRef;
  @HostBinding('class.no-editors') noEditors: boolean;

  focusFirstEditor = true;

  constructor(
    private el: ElementRef,
    private viewContainer: ViewContainerRef,
    private componentFactoryResolver: ComponentFactoryResolver,
    private frameService: FrameService,
    private modKeyService: ModKeyService
  ) {
  }

  private createAndRegister(layout: GoldenLayout.Config) {
    this.layout = new GoldenLayout(layout, this.layoutContainer.nativeElement);
    this.layout.on('itemDestroyed', destroyedItem => {
      const container = destroyedItem.container;
      if (!container) { return; }
      const compRef = container.compRef;
      if (!compRef) { return; }

      let last: GoldenLayout.ContentItem;
      let beforeDestroyed: GoldenLayout.ContentItem;
      forEachEditor(this.layout, (_ed, it) => {
        if (it === destroyedItem) {
          beforeDestroyed = last;
        }
        last = it;
      });

      const tab = findAncestor(beforeDestroyed || last, it => it.type === 'stack');
      if (tab) {
        setTimeout(() => {
          const active = tab.getActiveContentItem();
          if (active.container.compRef) {
            getContentItemEditor(active).focus();
          }
        });
      }
      compRef.destroy();
      delete container.compRef;
      setTimeout(() => appEvent.resize.emit());
    });

    const activeItems: GoldenLayout.ContentItem[] = [];
    const activatedItems: GoldenLayout.ContentItem[] = [];

    this.layout.on('stackCreated', stack => {
      stack.on('activeContentItemChanged', it => {
        if (!this.focusFirstEditor) {
          this.lastFocusEditorId = getContentItemEditor(it).id;
        }
      });
    });

    let firstLayout = true;
    this.layout.on('stateChanged', e => {
      let tabNum = 1;
      let lastStack: GoldenLayout.ContentItem;
      this.noEditors = true;
      accept(this.layout.root, it => {
        if (it.type === 'stack') {
          const active = it.getActiveContentItem();
          if (active) {
            activeItems.push(active);
          }
          lastStack = it;
        } else if (it.componentName === EDITOR_COMPONENT) {
          this.noEditors = false;
          const ed = getContentItemEditor(it);
          if (!this.lastFocusEditorId || this.focusFirstEditor) {
            this.lastFocusEditorId = ed.id;
            this.focusFirstEditor = false;
          }
          const tab = getTabElement(it);
          tab.off('click');
          tab.on('click', () => getContentItemEditor(it).focus());
          $('.clic-tab-number', tab).text(String(tabNum));

          if (ed.id === this.lastFocusEditorId) {
            activatedItems.push(it);
            ed.activate().then(() => setFocusedTabElement(it));
          }
          tabNum++;
        }
      });

      activeItems
        .filter(it => it.container.compRef && !activatedItems.includes(it))
        .forEach(it => getContentItemEditor(it).activate());

      appEvent.layout.next();

      if (firstLayout) {
        firstLayout = false;
      } else {
        appEvent.saveLayoutAuto.next();
      }
    });

    this.layout.on('initialised', () => {
      this.frameService.loadEditorSettings(this.layout);
      accept(this.layout.root, it => {
        if (it.type === 'stack') {
          it.setActiveContentItem(it.contentItems[0]);
        }
      });
    });

    this.layout.registerComponent(EDITOR_COMPONENT, (container, state) => {
      container.on('tab', tab => tab.element.append($('<div class="clic-tab-number"></div>')));

      this.createComponent<EditorComponent>(container, EditorComponent, ed => {
        ed.setTabTitle = title => container.setTitle(title);
        ed.id = state.editorId;
      });
    });
  }

  ngOnInit() {

    window.addEventListener('resize', () => appEvent.resize.next());

    registerKeyboardActions();

    const settings = this.frameService.loadSettings();
    this.createAndRegister(settings.layout);

    try {
      this.layout.init();
    } catch (err) {
      console.log(`error while initializing layout: ${err}. Starting fresh.`);
      this.layout.destroy();
      this.createAndRegister(DEFAULT_LAYOUT);
      this.layout.init();
    }

    this.subscriptions = [
      appEvent.newTerminal.subscribe(() => this.onNewTerminal()),
      appEvent.closeTerminal.subscribe(() => this.onCloseTerminal()),
      appEvent.selectTab.subscribe(num => this.onSelectTab(num)),
      appEvent.saveLayout.subscribe(() => this.frameService.saveSettings(this.layout)),
      appEvent.saveLayoutAuto.subscribe(() => this.frameService.saveSettingsThrottle(this.layout)),
      appEvent.sessionData.subscribe(pid => this.onSessionData(pid)),
      appEvent.focusEditor.subscribe(id => this.onFocusEditor(id)),
      appEvent.splitEditor.subscribe(id => this.onSplitEditor()),
      this.modKeyService.controlDownLong.subscribe(down => this.onControlDownLong(down))
    ];

    window.addEventListener('resize', () => this.layout.updateSize());

    $('.clic-loading').remove();
  }

  private onCloseTerminal() {
    let prevItem: GoldenLayout.ContentItem;
    accept(this.layout.root, it => {
      if (it.componentName === EDITOR_COMPONENT) {
        if (getContentItemEditor(it).isFocused) {
          it.remove();
          return true;
        }
        prevItem = it;
      }
    });
  }

  private onSplitEditor() {
    // const focusedItem = accept(this.layout.root, it => {
    //   if (it.componentName === EDITOR_COMPONENT && getContentItemEditor(it).id === this.lastFocusEditorId) {
    //     return it;
    //   }
    // });
    // if (!focusedItem) {
    //   return;
    // }

    // const tab = findAncestor(focusedItem, it => it.type === 'stack');
    // const row = findAncestor(tab, it => it.type === 'row');
    // if (!row) {
    //   const parent = tab.parent;
    //   parent.addChild({ type: 'row' });
    //   const newRow = parent.contentItems[parent.contentItems.length - 1];
    //   newRow.addChild(tab);
    //   newRow.addChild({ type: 'stack' });
    //   const newTab = newRow.contentItems[newRow.contentItems.length - 1];

    //   const ed = newEditor();
    //   this.lastFocusEditorId = ed.componentState.editorId;
    //   newTab.addChild(ed);
    // }
    // console.log('tabbbb', tab, row);
  }

  private onNewTerminal() {
    const focusedItem = accept(this.layout.root, it => {
      if (it.componentName === EDITOR_COMPONENT && getContentItemEditor(it).id === this.lastFocusEditorId) {
        return it;
      }
    });
    const tab = findAncestor(focusedItem, it => it.type === 'stack');
    const parent = tab || this.layout.root;
    const ed = newEditor();
    this.lastFocusEditorId = ed.componentState.editorId;
    parent.addChild(ed);
  }

  private onSelectTab(num: number) {
    let index = 1;
    accept(this.layout.root, it => {
      if (it.componentName === EDITOR_COMPONENT) {
        if (index === num) {
          const stack = findAncestor(it, anc => anc.type === 'stack');
          stack.setActiveContentItem(it);
          this.lastFocusEditorId = getContentItemEditor(it).id;
        }
        index++;
      }
    });
  }

  ngOnDestroy() {
    this.subscriptions.forEach(it => it.unsubscribe());
  }

  private createComponent<T>(container, classs: Type<T>, init: (instance: T) => void = () => undefined): void {
    const factory = this.componentFactoryResolver.resolveComponentFactory<T>(classs);
    const compRef = this.viewContainer.createComponent(factory);
    container.getElement().append(compRef.location.nativeElement);
    container.compRef = compRef;
    init(compRef.instance);
    compRef.changeDetectorRef.detectChanges();
  }

  private onSessionData(pid: number) {
    this.frameService.flashInactiveTab(this.layout, pid);
  }

  private onFocusEditor(id: string) {
    this.lastFocusEditorId = id;
    forEachEditor(this.layout, (ed, it) => {
      if (ed.id === id) {
        setFocusedTabElement(it, false);
      }
    });
  }

  private onControlDownLong(down: boolean) {
    const classList = this.el.nativeElement.classList;
    if (down) {
      classList.add('clic-show-tab-number');
    } else {
      classList.remove('clic-show-tab-number');
    }
  }
}
