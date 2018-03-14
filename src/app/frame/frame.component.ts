import { Component, OnInit, ElementRef, ViewChild, ViewContainerRef, ComponentFactoryResolver, OnDestroy, Type, ComponentRef } from '@angular/core';
import { EditorComponent } from '../editor/editor.component';
import { SessionService } from '@services/session.service';
import { Subscription } from 'rxjs/Subscription';
import { appEvent } from '@services/app-event';
import { QEditorComponent } from '../q-editor/q-editor.component';

const EDITOR: GoldenLayout.ComponentConfig = {
  type: 'component',
  componentName: 'clic-editor',
};

const Q_EDITOR: GoldenLayout.ComponentConfig = {
  type: 'component',
  componentName: 'q-editor',
};

const CLIC_ID = 'clicid';

function acceptLayout(item: GoldenLayout.ContentItem, visitor: (it: GoldenLayout.ContentItem) => void) {
  visitor(item);
  const children = item.contentItems;
  if (children) {
    children.forEach(child => acceptLayout(child, visitor));
  }
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
    private componentFactoryResolver: ComponentFactoryResolver,
    private sessionService: SessionService
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
      appEvent.closeTerminal.subscribe(el => this.onCloseTerminal(el)),
      appEvent.pipeToQEditor.subscribe(el => this.onPipeToQEditor(el))
    ];

    this.layout.init();

    window.addEventListener('resize', () => this.layout.updateSize());
  }
  private getClicId(el: HTMLElement) {
    return $(el).parents(`[${CLIC_ID}]`).attr(CLIC_ID);
  }

  onCloseTerminal(el: HTMLElement) {
    const id = this.getClicId(el);
    acceptLayout(this.layout.root, (it: any) => {
      if (it.componentName === 'clic-editor') {
        const containerId = it.container[CLIC_ID];
        if (containerId === id) {
          it.remove();
        }
      }
    });
  }

  onNewTerminal() {
    const root = this.layout.root;
    const container = root.contentItems[0] || root;
    container.addChild(EDITOR);
  }

  onPipeToQEditor(el: HTMLElement) {

    const id = this.getClicId(el);
    acceptLayout(this.layout.root, (it: any) => {
      if (it.componentName === 'clic-editor') {
        const container = it.container;
        if (container[CLIC_ID] === id) {
          // const root = this.layout.root;
          // const container = root.contentItems[0] || root;
          const stack = container.parent.parent;
          stack.addChild(Q_EDITOR);
        }
      }
    });

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
