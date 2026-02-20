import { Component, inject, Input } from '@angular/core';
import { NgControl } from '@angular/forms';

@Component({
  selector: 'input[ds-input], textarea[ds-input]',
  template: '',
  styleUrl: './ds-input.scss',
})
export class DsInput {

  readonly ngControl = inject(NgControl, { optional: true, self: true });

  get errorState(): boolean {
    const control = this.ngControl?.control;
    return !!control && control.invalid && control.touched;
  }
}
