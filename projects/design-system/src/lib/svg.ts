import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Svg {
  private cache = new Map<string, SVGElement>();
  private http = inject(HttpClient);

  getImage(name: string): Observable<SVGElement> {
    if (this.cache.has(name)) {
      // clone so multiple icons don’t share the same node
      return of(this.cache.get(name)!.cloneNode(true) as SVGElement);
    }

    return this.http.get(`/assets/svg/${name}.svg`, { responseType: 'text' }).pipe(
      map((svgText) => this.parseSvg(svgText)),
      tap((svg) => this.cache.set(name, svg)),
      map((svg) => svg.cloneNode(true) as SVGElement),
    );
  }

  private parseSvg(svgText: string): SVGElement {
    const div = document.createElement('div');
    div.innerHTML = svgText;

    const svg = div.querySelector('svg');
    if (!svg) {
      throw new Error('Invalid SVG');
    }

    return svg;
  }
}
