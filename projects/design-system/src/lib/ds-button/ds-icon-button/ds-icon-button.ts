import { Component, computed, input, Signal } from '@angular/core';
import { DsButtonColor, DsButtonSize, DsButtonVariant } from '../ds-button.types';
import { composeButtonClasses } from '../ds-button.utils';
import { SvgComponent } from '../../svg/svg';

@Component({
  selector: 'button[ds-icon-button]',
  templateUrl: './ds-icon-button.html',
  styleUrl: './ds-icon-button.scss',
  imports: [SvgComponent],
  host: {
    '[class]': 'composedClasses()',
    '[attr.aria-label]': 'ariaLabel()',
  },
})
export class DsIconButton {
  readonly variant = input<DsButtonVariant>('primary');
  readonly color = input<DsButtonColor>('green');
  readonly size = input<DsButtonSize>('md');
  readonly isFloating = input(false);
  readonly icon = input.required<string>();
  readonly ariaLabel = input.required<string>();

  readonly iconSize: Signal<string> = computed(() => {
    return this.size() === 'sm' ? '1rem' : '1.5rem';
  });

  protected readonly composedClasses = computed(() => {
    return composeButtonClasses(
      [this.variant(), this.size(), this.color()],
      this.isFloating(),
    );
  });
}
