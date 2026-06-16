import { Directive, ElementRef, inject } from '@angular/core';

let nextUniqueId = 0;

@Directive({
  selector: 'otp-hint',
  host: {
    '[attr.id]': 'id',
  },
})
export class HintDirective {
  private readonly elementRef = inject(ElementRef);
  readonly id = this.elementRef.nativeElement.getAttribute('id') || `otp-hint-${nextUniqueId++}`;
}
