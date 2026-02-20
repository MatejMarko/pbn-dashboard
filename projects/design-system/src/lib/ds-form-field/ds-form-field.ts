import { Component, ContentChild, HostBinding, ViewEncapsulation } from '@angular/core';
import { DsInput } from '../ds-input/ds-input';

@Component({
  selector: 'ds-form-field',
  templateUrl: './ds-form-field.html',
  styleUrl: './ds-form-field.scss',
  encapsulation: ViewEncapsulation.None,
})
export class DsFormField {
  @ContentChild(DsInput) dsInput?: DsInput;

  get shouldShowError(): boolean {
    return this.dsInput?.errorState ?? false;
  }

  @HostBinding('class')
  get hostClasses(): string {
    const control = this.dsInput?.ngControl?.control;
    if (!control) return '';

    const classes: string[] = [];

    // todo: perhaps rename the classes?
    if (control.invalid) classes.push('ds-invalid');
    if (control.valid) classes.push('ds-valid');
    if (control.touched) classes.push('ds-touched');
    if (control.untouched) classes.push('ds-untouched');
    if (control.dirty) classes.push('ds-dirty');
    if (control.pristine) classes.push('ds-pristine');
    if (this.shouldShowError) classes.push('ds-error-visible');

    return classes.join(' ');
  }
}
