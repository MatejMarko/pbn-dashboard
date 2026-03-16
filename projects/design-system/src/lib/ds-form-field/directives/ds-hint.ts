import { Directive, ElementRef, inject } from '@angular/core';

let nextUniqueId = 0;

@Directive({
  selector: 'ds-hint',
  host: {
    '[attr.id]': 'id',
  },
})
export class DsHint {
  private readonly elementRef = inject(ElementRef);
  readonly id = this.elementRef.nativeElement.getAttribute('id') || `ds-hint-${nextUniqueId++}`;
}
