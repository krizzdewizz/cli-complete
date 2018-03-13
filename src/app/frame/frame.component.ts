import { Component, OnInit, ElementRef, ViewChild, ViewContainerRef, ComponentFactoryResolver, OnDestroy } from '@angular/core';
import { EditorComponent } from '../editor/editor.component';
import { SessionService } from '@services/session.service';

const EDITOR: GoldenLayout.ComponentConfig = {
  type: 'component',
  componentName: 'clic-editor',
};

@Component({
  selector: 'clic-frame',
  templateUrl: './frame.component.html',
  styleUrls: ['./frame.component.scss']
})
export class FrameComponent implements OnInit, OnDestroy {
  private config: GoldenLayout.Config;
  private layout: GoldenLayoutX;

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
      const factory = this.componentFactoryResolver.resolveComponentFactory(EditorComponent);

      const compRef = this.viewContainer.createComponent(factory);
      container.getElement().append(compRef.location.nativeElement);
      container.compRef = compRef;

      compRef.changeDetectorRef.detectChanges();
    });

    this.layout.init();

    window.addEventListener('resize', () => this.layout.updateSize());
  }

  onNewSession() {
    const root = this.layout.root;
    const container = root.contentItems[0] || root;
    container.addChild(EDITOR);
  }

  ngOnDestroy() {
  }
}
