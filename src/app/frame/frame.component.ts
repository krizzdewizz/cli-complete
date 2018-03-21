import { Component, OnInit, ElementRef, ViewChild, ViewContainerRef, ComponentFactoryResolver, OnDestroy, Type } from '@angular/core';
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
      if (!container) {
        return;
      }
      const compRef = container.compRef;
      if (!compRef) {
        return;
      }
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
    });

    let firstLayout = true;
    this.layout.on('stateChanged', e => {
      let tabNum = 1;
      let lastStack: GoldenLayout.ContentItem;
      accept(this.layout.root, it => {
        if (it.type === 'stack') {
          lastStack = it;
        } else if (it.componentName === EDITOR_COMPONENT) {
          const tab = getTabElement(it);
          tab.off('click');
          tab.on('click', () => getContentItemEditor(it).focus());
          $('.clic-tab-number', tab).text(String(tabNum));
          const active = lastStack.getActiveContentItem();
          if (active === it) {
            getContentItemEditor(it).activate().then(() => setFocusedTabElement(it));
          }
          tabNum++;
        }
      });

      appEvent.layout.next();

      if (firstLayout) {
        firstLayout = false;
      } else {
        appEvent.saveLayoutAuto.next();
      }
    });

    this.layout.on('initialised', () => this.frameService.loadEditorContent(this.layout));

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
      this.modKeyService.controlDownLong.subscribe(down => this.onControlDownLong(down))
    ];

    window.addEventListener('resize', () => this.layout.updateSize());
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

  private onNewTerminal() {
    const focusedItem = accept(this.layout.root, it => {
      if (it.componentName === EDITOR_COMPONENT && getContentItemEditor(it).id === this.lastFocusEditorId) {
        return it;
      }
    });
    const tab = findAncestor(focusedItem, it => it.type === 'stack');
    const parent = tab || this.layout.root;
    parent.addChild(newEditor());
  }

  private onSelectTab(num: number) {
    let index = 1;
    accept(this.layout.root, it => {
      if (it.componentName === EDITOR_COMPONENT) {
        if (index === num) {
          getContentItemEditor(it).activate().then(() => {
            setFocusedTabElement(it);
            const stack = findAncestor(it, anc => anc.type === 'stack');
            stack.setActiveContentItem(it);
          });
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
