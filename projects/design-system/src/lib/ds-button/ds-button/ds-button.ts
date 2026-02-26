import { Component, computed, input, Signal } from '@angular/core';
import { DsButtonColor, DsButtonSize, DsButtonVariant } from '../ds-button.types';
import { composeButtonClasses } from '../ds-button.utils';
import { SvgComponent } from '../../../lib/svg/svg';

@Component({
  selector: 'button[ds-button]',
  templateUrl: './ds-button.html',
  styleUrl: './ds-button.scss',
  imports: [SvgComponent],
  host: {
    '[class]': 'composedClasses()',
  },
})
export class DsButton {
  readonly variant = input<DsButtonVariant>('primary');
  readonly color = input<DsButtonColor>('green');
  readonly size = input<DsButtonSize>('md');
  readonly isFloating = input(false);
  readonly leadingIcon = input<string | null>(null);

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
