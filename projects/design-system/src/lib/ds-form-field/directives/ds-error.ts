import { Directive, ElementRef, HostBinding, inject } from '@angular/core';

let nextUniqueId = 0;

@Directive({
  selector: 'ds-error',
})
export class DsError {
  private readonly elementRef = inject(ElementRef);
  readonly id = this.elementRef.nativeElement.getAttribute('id') || `ds-error-${nextUniqueId++}`;

  @HostBinding('attr.id')
  get hostId(): string {
    return this.id;
  }
}
