import { ChangeDetectionStrategy, Component, ElementRef, inject, signal } from '@angular/core';
import { NgControl, Validators } from '@angular/forms';

let nextUniqueId = 0;

@Component({
  selector: 'input[otp-input], textarea[otp-input]',
  template: '',
  styleUrl: './input.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.id]': 'id',
    '[attr.aria-invalid]': 'errorState',
    '[attr.aria-describedby]': 'ariaDescribedBy()',
    '[attr.aria-required]': 'ariaRequired',
  },
})
export class InputComponent {
  private readonly elementRef = inject(ElementRef);

  readonly ngControl = inject(NgControl, { optional: true, self: true });
  readonly id: string = this.elementRef.nativeElement.getAttribute('id') || `otp-input-${nextUniqueId++}`;
  readonly ariaDescribedBy = signal<string | null>(null);

  get ariaRequired(): boolean | null {
    const isRequired = this.ngControl?.control?.hasValidator(Validators.required);
    return isRequired || null;
  }

  get errorState(): boolean {
    const control = this.ngControl?.control;
    return !!control && control.invalid && control.touched;
  }

  get isRequired() {
    return this.ngControl?.control?.hasValidator(Validators.required) ?? false;
  }
}
