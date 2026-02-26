import { Component, computed, input } from '@angular/core';
import { DsButtonColor } from '../ds-button.types';
import { SvgComponent } from '../../svg/svg';

@Component({
  selector: 'button[ds-ghost-button]',
  templateUrl: './ghost-button.html',
  styleUrl: './ghost-button.scss',
  imports: [SvgComponent],
  host: {
    '[class]': 'color()',
  },
})
export class GhostButton {
  readonly color = input<DsButtonColor>('green');
  readonly purposeType = input.required<'action' | 'navigation'>();
  readonly icon = input<string | null>(null);
  readonly direction = input<'up' | 'down' | 'right' | 'left'>();

  protected directionIcon = computed(() => {
    switch (this.direction()) {
      case 'up':
        return 'OTP-icon-32x32-arrow-up';
      case 'down':
        return 'OTP-icon-32x32-arrow-down';
      case 'left':
        return 'OTP-icon-32x32-arrow-left';
      case 'right':
      default:
        return 'OTP-icon-32x32-arrow-right';
    }
  });
}
