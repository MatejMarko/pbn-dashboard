import { Component, computed, effect, input } from '@angular/core';
import { DsButtonColor } from '../ds-button.types';
import { SvgComponent } from '../../svg/svg';
import { SvgNames } from '../../svg/svg-names.enum';

@Component({
  selector: 'button[ds-ghost-button], a[ds-ghost-button]',
  templateUrl: './ghost-button.html',
  styleUrl: './ghost-button.scss',
  imports: [SvgComponent],
  host: {
    '[class]': 'color()',
    '[attr.aria-label]': 'ariaLabel()',
  },
})
export class GhostButton {
  readonly color = input<DsButtonColor>('green');
  readonly purposeType = input.required<'action' | 'navigation'>();

  /** Icon for action-purpose buttons. */
  readonly icon = input<string | null>(null);

  /**
   * Icon for navigation-purpose buttons. When set, replaces the projected
   * text content but the direction arrow is still rendered alongside it.
   * Ignored unless purposeType === 'navigation'.
   */
  readonly navigationIcon = input<SvgNames | null>(null);

  readonly direction = input<'up' | 'down' | 'right' | 'left'>();

  /** Required when navigationIcon is set (no text to name the button). */
  readonly ariaLabel = input<string | null>(null);

  /** True when the navigation button renders an icon instead of text. */
  protected readonly isIconOnly = computed(
    () => this.purposeType() === 'navigation' && this.navigationIcon() !== null,
  );

  constructor() {
    // WCAG AA: an icon-only button must have an accessible name.
    effect(() => {
      if (this.isIconOnly() && !this.ariaLabel()) {
        throw new Error(
          '[ds-ghost-button] navigationIcon requires an ariaLabel for accessibility.',
        );
      }
    });
  }

  protected directionIcon = computed(() => {
    switch (this.direction()) {
      case 'up':
        return 'OTP-icon-32x32-arrow-up';
      case 'down':
        return 'OTP-icon-32x32-arrow-down';
      case 'left':
        return 'OTP-icon-32x32-arrow-left';
      case 'right':
        return 'OTP-icon-32x32-arrow-right';
      // no direction => no icon
      default:
        return null;
    }
  });
}
