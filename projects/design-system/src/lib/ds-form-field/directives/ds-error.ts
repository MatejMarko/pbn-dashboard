import { Directive, ElementRef, inject } from '@angular/core';

let nextUniqueId = 0;

@Directive({
  selector: 'ds-error',
  host: {
    '[attr.id]': 'id',
  },
})
export class DsError {
  private readonly elementRef = inject(ElementRef);
  readonly id = this.elementRef.nativeElement.getAttribute('id') || `ds-error-${nextUniqueId++}`;
}
