import { Component, OnInit, ElementRef, ViewChild, ViewContainerRef, ComponentFactoryResolver, OnDestroy, Type, ComponentRef } from '@angular/core';
import { EditorComponent } from '../editor/editor.component';
import { Subscription } from 'rxjs/Subscription';
import { appEvent } from '@services/app-event';
import { QEditorComponent } from '../q-editor/q-editor.component';
import { findAncestor, accept } from '@util/util';

const { remote } = window.require('electron');
const { setGlobalActionCallback } = remote.require('./global-action');

const EDITOR: GoldenLayout.ComponentConfig = {
  type: 'component',
  componentName: 'clic-editor',
};

const Q_EDITOR: GoldenLayout.ComponentConfig = {
  type: 'component',
  componentName: 'q-editor',
};

const CLIC_ID = 'clicid';

function getContentItemEditor(it: GoldenLayout.ContentItem): EditorComponent {
  return (it as any).container.compRef.instance;
}

@Component({
  selector: 'clic-frame',
  templateUrl: './frame.component.html',
  styleUrls: ['./frame.component.scss']
})
export class FrameComponent implements OnInit, OnDestroy {
  private config: GoldenLayout.Config;
  private layout: GoldenLayoutX;
  private subscriptions: Subscription[];

  private static nextId = 0;

  @ViewChild('layoutContainer') layoutContainer: ElementRef;

  constructor(
    private el: ElementRef,
    private viewContainer: ViewContainerRef,
    private componentFactoryResolver: ComponentFactoryResolver
  ) {
    this.config = {
      content: [{
        type: 'stack',
        content: [
          EDITOR
        ]
      }],
      labels: {
        close: 'Close',
        maximise: 'Maximize',
        minimise: 'Minimize',
      }
    };
  }

  ngOnInit() {
    this.layout = new GoldenLayout(this.config, this.layoutContainer.nativeElement);

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

    this.layout.on('stateChanged', () => appEvent.layout.next());

    this.layout.registerComponent('clic-editor', container => {
      const compRef = this.createComponent<EditorComponent>(container, EditorComponent);
      compRef.instance.setTabTitle = title => container.setTitle(title);
    });

    this.layout.registerComponent('q-editor', container => this.createComponent<QEditorComponent>(container, QEditorComponent));

    this.subscriptions = [
      appEvent.newTerminal.subscribe(() => this.onNewTerminal()),
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
    container.addChild(EDITOR);
  }

  ngOnDestroy() {
    this.subscriptions.forEach(it => it.unsubscribe());
  }

  private createComponent<T>(container, classs: Type<T>): ComponentRef<T> {
    const factory = this.componentFactoryResolver.resolveComponentFactory<T>(classs);
    const compRef = this.viewContainer.createComponent(factory);
    container.getElement().append(compRef.location.nativeElement);
    container.compRef = compRef;
    const id = `ed${FrameComponent.nextId}`;
    container[CLIC_ID] = id;
    container.getElement().attr(CLIC_ID, id);
    FrameComponent.nextId++;
    compRef.changeDetectorRef.detectChanges();
    return compRef;
  }
}
