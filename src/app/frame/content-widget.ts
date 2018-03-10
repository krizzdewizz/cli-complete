import { Widget } from '@phosphor/widgets';
import { Message } from '@phosphor/messaging';

export class ContentWidget extends Widget {

    // static createNode(): HTMLElement {
    //     const node = document.createElement('div');
    //     const content = document.createElement('div');
    //     const input = document.createElement('input');
    //     input.placeholder = 'Placeholder...';
    //     content.appendChild(input);
    //     node.appendChild(content);
    //     return node;
    // }

    constructor(name: string, node: HTMLElement) {
        // super({ node: ContentWidget.createNode() });
        super({ node });
        this.setFlag(Widget.Flag.DisallowLayout);
        this.addClass('content');
        this.addClass(name.toLowerCase());
        this.title.label = name;
        this.title.closable = true;
        this.title.caption = `Long description for: ${name}`;
    }

    // get inputNode(): HTMLInputElement {
    //     return this.node.getElementsByTagName('input')[0] as HTMLInputElement;
    // }

    // protected onActivateRequest(msg: Message): void {
    //     if (this.isAttached) {
    //         this.inputNode.focus();
    //     }
    // }
}
