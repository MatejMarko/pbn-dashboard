import { AfterContentChecked, AfterContentInit, Component, ContentChild, ElementRef, HostBinding, inject, ViewEncapsulation } from '@angular/core';
import { DsInput } from '../ds-input/ds-input';
import { Validators } from '@angular/forms';
import { DsLabel } from './directives/ds-label';
import { DsError } from './directives/ds-error';
import { DsHint } from './directives/ds-hint';

@Component({
  selector: 'ds-form-field',
  templateUrl: './ds-form-field.html',
  styleUrl: './ds-form-field.scss',
  encapsulation: ViewEncapsulation.None,
})
export class DsFormField implements AfterContentInit, AfterContentChecked {
  private readonly elementRef = inject(ElementRef);

  @ContentChild(DsInput) dsInput?: DsInput;
  @ContentChild(DsLabel) dsLabel?: DsLabel;
  @ContentChild(DsError) dsError?: DsError;
  @ContentChild(DsHint) dsHint?: DsHint;

  ngAfterContentInit(): void {
    this.validateUsage();
  }

  ngAfterContentChecked(): void {
    this.syncAriaDescribedBy();
  }

  get isRequired(): boolean {
    return this.dsInput?.isRequired ?? false;
  }

  get shouldShowError(): boolean {
    return this.dsInput?.errorState ?? false;
  }

  private syncAriaDescribedBy(): void {
    if (!this.dsInput) return;

    if (this.shouldShowError && this.dsError) {
      this.dsInput.ariaDescribedBy = this.dsError.id;
    } else if (this.dsHint) {
      this.dsInput.ariaDescribedBy = this.dsHint.id;
    } else {
      this.dsInput.ariaDescribedBy = null;
    }
  }

  private validateUsage(): void {
    if (typeof ngDevMode === 'undefined' || ngDevMode) {
      if (!this.dsInput) {
        console.warn('ds-form-field: Missing projected <input ds-input> or <textarea ds-input>.');
      }
      if (!this.dsLabel) {
        console.warn('ds-form-field: Missing projected <ds-label>. Every form field should have a label for accessibility.');
      }
      const nestedLabel = this.elementRef.nativeElement.querySelector('ds-label label');
      if (nestedLabel) {
        console.warn('ds-form-field: Avoid nesting a <label> inside <ds-label>. The component already wraps your content in a <label> element.');
      }
    }
  }

  @HostBinding('class')
  get hostClasses(): string {
    const control = this.dsInput?.ngControl?.control;
    if (!control) return '';

    const classes: string[] = [];

    if (control.disabled) classes.push('ds-disabled');
    if (this.shouldShowError) classes.push('ds-error-visible');

    // currently not used but can be useful
    // if (control.invalid) classes.push('ds-invalid');
    // if (control.valid) classes.push('ds-valid');
    // if (control.touched) classes.push('ds-touched');
    // if (control.untouched) classes.push('ds-untouched');
    // if (control.dirty) classes.push('ds-dirty');
    // if (control.pristine) classes.push('ds-pristine');

    return classes.join(' ');
  }
}
