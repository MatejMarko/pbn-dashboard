import { Component, effect, ElementRef, inject, input, isDevMode } from '@angular/core';
import { Svg, SvgSource } from '../svg';
import { SvgNames } from './svg-names.enum';

@Component({
  selector: 'otp-svg',
  standalone: true,
  imports: [],
  styleUrl: './svg.scss',
  template: '',
  host: {
    class: 'otp-svg',
  },
})
export class SvgComponent {
  readonly name = input.required<SvgNames | string>();
  readonly size = input<number | string | null>(null);
  readonly width = input<number | string | null>();
  readonly height = input<number | string | null>();
  readonly source = input<SvgSource>('lib');

  private registry = inject(Svg);
  private el = inject(ElementRef<HTMLElement>);
  private host = this.el.nativeElement;

  private effectRenderSvg = () => {
    const iconName = this.name();
    if (!iconName) return;

    if (isDevMode() && !Object.values(SvgNames).includes(iconName as SvgNames)) {
      console.warn(
        `[otp-svg] "${iconName}" is not a known SvgNames value. ` +
        `Consider using a value from the SvgNames enum for type safety.`
      );
    }

    this.registry.getImage(iconName, this.source()).subscribe((svg) => {
      this.renderSvg(svg);
    });
  };

  private effectApplySizing = () => {
    this.applySizing();
  };

  constructor() {
    effect(this.effectRenderSvg);
    effect(this.effectApplySizing);
  }

  private renderSvg(svg: SVGElement) {
    svg.style.width = '100%';
    svg.style.height = '100%';
    svg.style.flexShrink = '0';

    this.host.innerHTML = '';
    this.host.appendChild(svg);
  }

  private applySizing() {
    const style = this.host.style;

    // reset
    style.width = '';
    style.height = '';

    if (this.width() != null && this.height() != null) {
      style.width = this.toCssSize(this.width()!);
      style.height = this.toCssSize(this.height()!);
    } else if (this.size() != null) {
      const v = this.toCssSize(this.size()!);
      style.width = v;
      style.height = v;
    }
  }

  private toCssSize(value: number | string): string {
    return typeof value === 'number' ? `${value}px` : value;
  }
}
