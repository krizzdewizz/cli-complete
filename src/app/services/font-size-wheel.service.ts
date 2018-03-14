import { Injectable, NgZone } from '@angular/core';
import { Style } from '@style/style';
import { PromptService } from '@services/prompt.service';

@Injectable()
export class FontSizeWheelService {

    constructor(private promptService: PromptService, private zone: NgZone) {
    }

    onWheel(style: Style, e: MouseWheelEvent): boolean {
        if (!e.ctrlKey) {
            return false;
        }

        const increase = e.deltaY < 0;
        let changed = false;
        if (increase) {
            style.fontSize++;
            changed = true;
        } else if (style.fontSize > 6) {
            style.fontSize--;
            changed = true;
        }
        const diff = style.fontSize - Style.fontSize;
        const diffString = diff === 0 ? '' : ` (${diff > 0 ? '+' : ''}${diff})`;
        this.zone.run(() => this.promptService.showInfoForAWhile(`${style.fontSize}px${diffString}`));
        return changed;
    }
}
