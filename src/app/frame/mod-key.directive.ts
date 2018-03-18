import { Directive, HostListener } from '@angular/core';
import { ModKeyService } from './mod-key.service';

@Directive({
    selector: '[modKey]'
})
export class ModKeyDirective {

    constructor(private modKeyService: ModKeyService) {
    }

    @HostListener('keydown', ['$event']) onKeyDown(e: KeyboardEvent) {
        this.modKeyService.handleModKey(e, true);
    }

    @HostListener('keyup', ['$event']) onKeyUp(e: KeyboardEvent) {
        this.modKeyService.handleModKey(e, false);
    }
}
