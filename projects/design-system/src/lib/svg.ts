import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable, of, tap } from 'rxjs';

export enum SvgPaths {
  appPath = '/assets/svg',
  libPath = '/assets/otp-design-system/svg',
}

export type SvgSource = 'app' | 'lib';

@Injectable({
  providedIn: 'root',
})
export class Svg {
  private cache = new Map<string, SVGElement>();
  private http = inject(HttpClient);

  getImage(name: string, source: SvgSource = 'lib'): Observable<SVGElement> {
    const cacheKey = `${source}:${name}`;

    if (this.cache.has(cacheKey)) {
      return of(this.cache.get(cacheKey)!.cloneNode(true) as SVGElement);
    }

    const basePath = source === 'lib' ? SvgPaths.libPath : SvgPaths.appPath;
    const url = `${basePath}/${name}.svg`;

    return this.http.get(url, { responseType: 'text' }).pipe(
      map((svgText) => this.parseSvg(svgText)),
      tap((svg) => this.cache.set(cacheKey, svg)),
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
