import { Component, OnInit, ElementRef, ViewChild, ViewContainerRef, ComponentFactoryResolver, OnDestroy } from '@angular/core';
import { EditorComponent } from '../editor/editor.component';
import { SessionService } from '@services/session.service';
import { Subscription } from 'rxjs/Subscription';
import { eventBus } from '@services/app-event';

const EDITOR: GoldenLayout.ComponentConfig = {
  type: 'component',
  componentName: 'clic-editor',
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
      }]
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

    this.layout.registerComponent('clic-editor', (container, componentState) => {
      const factory = this.componentFactoryResolver.resolveComponentFactory<EditorComponent>(EditorComponent);

      const compRef = this.viewContainer.createComponent(factory);
      container.getElement().append(compRef.location.nativeElement);
      container.compRef = compRef;
      const id = `ed${FrameComponent.nextId}`;
      container[CLIC_ID] = id;
      container.getElement().attr(CLIC_ID, id);
      FrameComponent.nextId++;
      compRef.instance.setTabTitle = title => {
        return container.setTitle(title);
      };

      compRef.changeDetectorRef.detectChanges();
    });

    this.subscriptions = [
      eventBus.newTerminal.subscribe(() => this.onNewTerminal()),
      eventBus.closeTerminal.subscribe(el => this.onCloseTerminal(el))
    ];

    this.layout.init();

    window.addEventListener('resize', () => this.layout.updateSize());
  }

  onCloseTerminal(el: HTMLElement) {
    const par = $(el).parents(`[${CLIC_ID}]`);
    const id = par.attr(CLIC_ID);
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
    const child = container.addChild(EDITOR);
    console.log('cccc', child);

  }

  ngOnDestroy() {
    this.subscriptions.forEach(it => it.unsubscribe());
  }
}
