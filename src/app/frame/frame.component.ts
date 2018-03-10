import { Component, OnInit, ElementRef, ViewChild, ViewChildren, QueryList, ViewContainerRef, ComponentFactoryResolver, OnDestroy } from '@angular/core';
import { EditorComponent } from '../editor/editor.component';

@Component({
  selector: 'clic-frame',
  templateUrl: './frame.component.html',
  styleUrls: ['./frame.component.scss']
})
export class FrameComponent implements OnInit, OnDestroy {
  private config: GoldenLayout.Config;
  private layout: any;

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
          {
            type: 'component',
            componentName: 'test1',
            componentState: {
              message: 'Top Left'
            }
          },
          {
            type: 'component',
            componentName: 'test1',
            componentState: {
              message: 'Top Left'
            }
          }
        ]
      }]
    };
  }

  ngOnInit() {
    this.layout = new GoldenLayout(this.config, this.layoutContainer.nativeElement);

    this.layout.registerComponent('test1', (container, componentState) => {
      const factory = this.componentFactoryResolver.resolveComponentFactory(EditorComponent);

      const compRef = this.viewContainer.createComponent(factory);
      container.getElement().append($(compRef.location.nativeElement));
      compRef.changeDetectorRef.detectChanges();
    });

    this.layout.init();
    window.addEventListener('resize', () => {
      this.layout.updateSize();
    });

  }
  ngOnDestroy() {
  }

}
