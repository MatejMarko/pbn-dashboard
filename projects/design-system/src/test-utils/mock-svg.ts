import { Svg } from '../lib/svg';
import { of } from 'rxjs';

export function provideMockSvg() {
  const mockSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  return {
    provide: Svg,
    useValue: { getImage: () => of(mockSvg.cloneNode(true) as SVGElement) },
  };
}
