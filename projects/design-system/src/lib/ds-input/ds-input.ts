import { Component, ElementRef, HostBinding, inject, Input } from '@angular/core';
import { NgControl, Validators } from '@angular/forms';
import { FormField } from '@angular/forms/signals';

let nextUniqueId = 0;

@Component({
  selector: 'input[ds-input], textarea[ds-input]',
  template: '',
  styleUrl: './ds-input.scss',
})
export class DsInput {
  private readonly elementRef = inject(ElementRef);

  readonly ngControl = inject(NgControl, { optional: true, self: true });
  readonly id: string = this.elementRef.nativeElement.getAttribute('id') || `ds-input-${nextUniqueId++}`;

  @HostBinding('attr.id')
  get hostId(): string {
    return this.id;
  }

  @HostBinding('attr.aria-invalid')
  get ariaInvalid(): boolean {
    return this.errorState;
  }

  @HostBinding('attr.aria-describedby')
  ariaDescribedBy: string | null = null;

  @HostBinding('attr.aria-required')
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
