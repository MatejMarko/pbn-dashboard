import { Component, HostBinding, Input } from '@angular/core';
import { SVGIcons } from '../../../../../src/icons';

@Component({
  selector: 'button[ds-button]',
  imports: [],
  templateUrl: './ds-button.html',
  styleUrl: './ds-button.scss',
})
export class DsButton {
  @Input() variant: 'primary' | 'secondary' | 'tertiary' = 'primary';
  @Input() color: 'green' | 'orange' | 'blue' | 'red' = 'green';
  @Input() size: 'xl' | 'lg' | 'md' | 'sm' = 'md';
  @Input() type: 'button' | 'reset' | 'submit' = 'button';
  @Input() iconOnly = false;
  @Input() icon: string | null = null; // required if iconOnly
  @Input() isFloating = false;
  //@Input({required: true}) text!: string;
  // @Input() disabled = false;
  @Input() leadingIcon: SVGIcons | undefined;
  @Input() trailingIcon: string | undefined;
  @Input() loadingIcon: string | undefined;

  constructor() {
    this.leadingIcon = 'OTP-icon-32x32-chatbot';
  }

  @HostBinding('class')
  get composedClasses(): string {
    return [
      this.variant,
      this.size,
      this.color,
    ]
      .filter(Boolean)
      .join(' ');
  }
}
