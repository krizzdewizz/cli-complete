import { Component, OnInit, ElementRef, ViewChild, ViewContainerRef, ComponentFactoryResolver, OnDestroy, Type, ComponentRef } from '@angular/core';
import { EditorComponent } from '../editor/editor.component';
import { Subscription } from 'rxjs/Subscription';
import { appEvent } from '@services/app-event';
import { findAncestor, accept } from '@util/util';
import { FrameService, newEditor, getContentItemEditor } from './frame.service';

const { remote } = window.require('electron');
const { setGlobalActionCallback } = remote.require('./global-action');

const Q_EDITOR: GoldenLayout.ComponentConfig = {
  type: 'component',
  componentName: 'q-editor',
};

@Component({
  selector: 'clic-frame',
  templateUrl: './frame.component.html',
  styleUrls: ['./frame.component.scss']
})
export class FrameComponent implements OnInit, OnDestroy {
  private layout: GoldenLayoutX;
  private subscriptions: Subscription[];

  @ViewChild('layoutContainer') layoutContainer: ElementRef;

  constructor(
    private el: ElementRef,
    private viewContainer: ViewContainerRef,
    private componentFactoryResolver: ComponentFactoryResolver,
    private frameService: FrameService
  ) {
  }

  ngOnInit() {
    const settings = this.frameService.loadSettings();
    this.layout = new GoldenLayout(settings.layout, this.layoutContainer.nativeElement);

    setGlobalActionCallback(it => this.handleGlobalAction(it));

    this.layout.on('itemDestroyed', ({ container }) => {
      if (container) {
        const compRef = container.compRef;
        if (compRef) {
          compRef.destroy();
          delete container.compRef;
        }
      }
    });

    let firstLayout = true;
    this.layout.on('stateChanged', e => {
      appEvent.layout.next();

      if (firstLayout) {
        firstLayout = false;
      } else {
        appEvent.saveLayoutAuto.next();
      }
    });

    this.layout.on('initialised', () => this.frameService.loadEditorContent(this.layout));

    this.layout.registerComponent('clic-editor', container => {
      const compRef = this.createComponent<EditorComponent>(container, EditorComponent);
      compRef.instance.setTabTitle = title => container.setTitle(title);
    });

    // this.layout.registerComponent('q-editor', (container, state) => this.createComponent<QEditorComponent>(container, QEditorComponent));

    this.subscriptions = [
      appEvent.newTerminal.subscribe(() => this.onNewTerminal()),
      appEvent.saveLayout.subscribe(() => this.frameService.saveSettings(this.layout)),
      appEvent.saveLayoutAuto.subscribe(() => this.frameService.saveSettingsThrottle(this.layout)),
    ];

    this.layout.init();

    window.addEventListener('resize', () => this.layout.updateSize());
  }

  onCloseTerminal() {
    let prevItem: GoldenLayout.ContentItem;
    const found = accept(this.layout.root, (it: any) => {
      if (it.componentName === 'clic-editor') {
        if (getContentItemEditor(it).isFocused) {
          it.remove();
          return true;
        }
        prevItem = it;
      }
    });

    if (found && prevItem) {
      getContentItemEditor(prevItem).focus();
    }
  }

  private handleGlobalAction(id: string) {
    this.handleTabSelect(id);

    switch (id) {
      case 'close-terminal':
        return this.onCloseTerminal();
      case 'new-terminal':
        return this.onNewTerminal();
    }
  }

  private handleTabSelect(id: string) {
    if (!id.startsWith('select-tab-')) {
      return;
    }

    const num = Number(id.split('-')[2]);
    let index = 1;
    accept(this.layout.root, (it: any) => {
      if (it.componentName === 'clic-editor') {
        if (index === num) {
          const stack = findAncestor(it, anc => anc.type === 'stack');
          stack.setActiveContentItem(it);
          getContentItemEditor(it).focus();
        }
        index++;
      }
    });
  }

  onNewTerminal() {
    const root = this.layout.root;
    const container = root.contentItems[0] || root;
    container.addChild(newEditor());
  }

  ngOnDestroy() {
    this.subscriptions.forEach(it => it.unsubscribe());
  }

  private createComponent<T>(container, classs: Type<T>): ComponentRef<T> {
    const factory = this.componentFactoryResolver.resolveComponentFactory<T>(classs);
    const compRef = this.viewContainer.createComponent(factory);
    container.getElement().append(compRef.location.nativeElement);
    container.compRef = compRef;
    compRef.changeDetectorRef.detectChanges();
    return compRef;
  }
}
