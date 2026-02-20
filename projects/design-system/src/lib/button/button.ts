import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'lib-button',
  imports: [CommonModule],
  templateUrl: './button.html',
  styleUrl: './button.scss',
})
export class Button {
  @Input({required: true}) variant: 'primary' | 'secondary' | 'tertiary' = 'primary';
  @Input({required: true}) color: 'green' | 'orange' | 'blue' | 'red' = 'green';
  @Input({required: true}) size: 'xl' | 'lg' | 'md' | 'sm' = 'md';
  @Input() type: 'button' | 'reset' | 'submit' = 'button';
  @Input() iconOnly = false;
  @Input() icon: string | null = null; // required if iconOnly
  @Input() isFloating = false;
  @Input({required: true}) text!: string;
  @Input() disabled = false;
  @Input() leadingIcon: string | undefined;
  @Input() trailingIcon: string | undefined;
  @Input() loadingIcon: string | undefined;
}
