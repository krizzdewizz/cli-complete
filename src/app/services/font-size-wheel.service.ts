import { Injectable } from '@angular/core';
import { Style } from '@style/style';

@Injectable()
export class FontSizeWheelService {
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

        return changed;
    }
}
