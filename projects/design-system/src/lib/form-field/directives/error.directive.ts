import { Directive, ElementRef, inject } from '@angular/core';

let nextUniqueId = 0;

@Directive({
  selector: 'otp-error',
  host: {
    '[attr.id]': 'id',
  },
})
export class ErrorDirective {
  private readonly elementRef = inject(ElementRef);
  readonly id = this.elementRef.nativeElement.getAttribute('id') || `otp-error-${nextUniqueId++}`;
}
