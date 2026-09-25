import { ChangeDetectionStrategy, Component, ElementRef, inject, signal } from '@angular/core';
import { NgControl, Validators } from '@angular/forms';
import { OTP_ERROR_STATE_MATCHER } from '../form-field/error-state-matcher';

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

  private readonly errorStateMatcher = inject(OTP_ERROR_STATE_MATCHER);

  /**
   * Whether the field renders as invalid. The rule comes from the injected
   * {@link OTP_ERROR_STATE_MATCHER}, so a form can defer errors until submit.
   */
  get errorState(): boolean {
    return this.errorStateMatcher.isErrorState(this.ngControl?.control ?? null);
  }

  get isRequired() {
    return this.ngControl?.control?.hasValidator(Validators.required) ?? false;
  }
}
