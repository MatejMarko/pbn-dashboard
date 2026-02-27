import { Component, computed, input } from '@angular/core';
import { SvgComponent } from '../svg/svg';

type IconBackgroundType = 'success' | 'warning' | 'pending' | 'error' | 'neutral';
// px values defined in figma
type IconBackgroundSizePx = '24' | '32' | '40' | '48' | '56' | '64' | '72' | '80';
type IconBackgroundSize = 'xxs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | 'xxxl';
const SIZE_MAPPER: {[T in IconBackgroundSizePx]: IconBackgroundSize} = {
  '24': 'xxs',
  '32': 'xs',
  '40': 'sm',
  '48': 'md',
  '56': 'lg',
  '64': 'xl',
  '72': 'xxl',
  '80': 'xxxl',
};

@Component({
  selector: 'otp-icon-background',
  imports: [SvgComponent],
  templateUrl: './icon-background.html',
  styleUrl: './icon-background.scss',
})
export class IconBackground {
  public type = input.required<IconBackgroundType>();
  public icon = input.required<string>();
  public size = input<IconBackgroundSizePx>('48');
  protected iconBackgroundSize = computed<IconBackgroundSize>(() => SIZE_MAPPER[this.size()]);
  protected iconSize = computed<string>(() => {
    switch (this.iconBackgroundSize()) {
      case 'xxs':
        return '0.75rem';
      case 'xs':
        return '1rem';
      case 'sm':
      case 'md':
      case 'lg':
      case 'xl':
        return '1.5rem';
      case 'xxl':
      case 'xxxl':
        return '3rem';
    }
  });

  protected readonly wrapperClasses = computed(() =>
    ['icon-wrapper', this.type(), this.iconBackgroundSize()].filter(Boolean).join(' ')
  );
}
