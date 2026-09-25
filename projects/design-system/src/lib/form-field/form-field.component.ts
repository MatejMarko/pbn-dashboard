import {
  AfterContentChecked,
  AfterContentInit,
  ChangeDetectionStrategy,
  Component,
  contentChild,
  input,
  ElementRef,
  inject,
  signal,
  ViewEncapsulation
} from '@angular/core';
import { InputComponent } from '../input/input.component';
import { LabelDirective } from './directives/label.directive';
import { ErrorDirective } from './directives/error.directive';
import { HintDirective } from './directives/hint.directive';

@Component({
  selector: 'otp-form-field',
  templateUrl: './form-field.component.html',
  styleUrl: './form-field.component.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.disabled]': 'dsInput()?.ngControl?.control?.disabled',
    '[class.error-visible]': 'shouldShowError()',
  },
})
export class FormFieldComponent implements AfterContentInit, AfterContentChecked {
  private readonly elementRef = inject(ElementRef);

  /**
   * Id of an element describing the field that lives outside it, e.g. a shared
   * error block under a group of fields. A projected `otp-error` or `otp-hint`
   * takes precedence.
   */
  readonly describedBy = input<string | null>(null);

  // todo: remove ds prefix
  readonly dsInput = contentChild(InputComponent);
  readonly dsLabel = contentChild(LabelDirective);
  readonly dsError = contentChild(ErrorDirective);
  readonly dsHint = contentChild(HintDirective);

  ngAfterContentInit(): void {
    this.validateUsage();
  }

  readonly isRequired = signal(false);
  readonly shouldShowError = signal(false);

  ngAfterContentChecked(): void {
    this.isRequired.set(this.dsInput()?.isRequired ?? false);
    this.shouldShowError.set(this.dsInput()?.errorState ?? false);
    this.syncAriaDescribedBy();
  }

  private syncAriaDescribedBy(): void {
    const input = this.dsInput();
    if (!input) return;

    if (this.shouldShowError() && this.dsError()) {
      input.ariaDescribedBy.set(this.dsError()!.id);
    } else if (this.dsHint()) {
      input.ariaDescribedBy.set(this.dsHint()!.id);
    } else {
      input.ariaDescribedBy.set(this.describedBy());
    }
  }

  private validateUsage(): void {
    if (typeof ngDevMode === 'undefined' || ngDevMode) {
      if (!this.dsInput()) {
        console.warn('otp-form-field: Missing projected <input otp-input> or <textarea otp-input>.');
      }
      if (!this.dsLabel()) {
        console.warn('otp-form-field: Missing projected <otp-label>. Every form field should have a label for accessibility.');
      }
      const nestedLabel = this.elementRef.nativeElement.querySelector('otp-label label');
      if (nestedLabel) {
        console.warn('otp-form-field: Avoid nesting a <label> inside <otp-label>. The component already wraps your content in a <label> element.');
      }
    }
  }
}
