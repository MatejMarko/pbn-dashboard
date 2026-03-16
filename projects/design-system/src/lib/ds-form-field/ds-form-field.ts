import {
  AfterContentChecked,
  AfterContentInit,
  ChangeDetectionStrategy,
  Component,
  contentChild,
  ElementRef,
  inject,
  ViewEncapsulation
} from '@angular/core';
import { DsInput } from '../ds-input/ds-input';
import { DsLabel } from './directives/ds-label';
import { DsError } from './directives/ds-error';
import { DsHint } from './directives/ds-hint';

@Component({
  selector: 'ds-form-field',
  templateUrl: './ds-form-field.html',
  styleUrl: './ds-form-field.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.ds-disabled]': 'dsInput()?.ngControl?.control?.disabled',
    '[class.ds-error-visible]': 'shouldShowError',
  },
})
export class DsFormField implements AfterContentInit, AfterContentChecked {
  private readonly elementRef = inject(ElementRef);

  readonly dsInput = contentChild(DsInput);
  readonly dsLabel = contentChild(DsLabel);
  readonly dsError = contentChild(DsError);
  readonly dsHint = contentChild(DsHint);

  ngAfterContentInit(): void {
    this.validateUsage();
  }

  ngAfterContentChecked(): void {
    this.syncAriaDescribedBy();
  }

  get isRequired(): boolean {
    return this.dsInput()?.isRequired ?? false;
  }

  get shouldShowError(): boolean {
    return this.dsInput()?.errorState ?? false;
  }

  private syncAriaDescribedBy(): void {
    const input = this.dsInput();
    if (!input) return;

    if (this.shouldShowError && this.dsError()) {
      input.ariaDescribedBy.set(this.dsError()!.id);
    } else if (this.dsHint()) {
      input.ariaDescribedBy.set(this.dsHint()!.id);
    } else {
      input.ariaDescribedBy.set(null);
    }
  }

  private validateUsage(): void {
    if (typeof ngDevMode === 'undefined' || ngDevMode) {
      if (!this.dsInput()) {
        console.warn('ds-form-field: Missing projected <input ds-input> or <textarea ds-input>.');
      }
      if (!this.dsLabel()) {
        console.warn('ds-form-field: Missing projected <ds-label>. Every form field should have a label for accessibility.');
      }
      const nestedLabel = this.elementRef.nativeElement.querySelector('ds-label label');
      if (nestedLabel) {
        console.warn('ds-form-field: Avoid nesting a <label> inside <ds-label>. The component already wraps your content in a <label> element.');
      }
    }
  }
}
