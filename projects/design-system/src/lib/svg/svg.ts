import { Component, effect, ElementRef, inject, input } from '@angular/core';
import { Svg } from '../svg';

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
  name = input.required<string>();
  size = input<number | string | null>(null);
  width = input<number | string | null>();
  height = input<number | string | null>();

  private registry = inject(Svg);
  private el = inject(ElementRef<HTMLElement>);
  private host = this.el.nativeElement;

  private effectRenderSvg = () => {
    const iconName = this.name();
    if (!iconName) return;

    this.registry.getImage(iconName).subscribe((svg) => {
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
