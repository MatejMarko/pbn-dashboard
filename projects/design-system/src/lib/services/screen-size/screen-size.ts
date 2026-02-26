import { Injectable, signal } from '@angular/core';
import { BreakpointObserver } from '@angular/cdk/layout';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

/** Current screen size category based on viewport width. Ordered large to small. */
export type ScreenSize = 'LG' | 'MD' | 'SM';

/** @internal Ordering for size comparisons — higher value = larger screen. */
export const SIZE_ORDER: Record<ScreenSize, number> = { SM: 0, MD: 1, LG: 2 };

/**
 * Reactive screen size tracking based on viewport width breakpoints.
 *
 * Breakpoints:
 * - `LG` — 1200px and above
 * - `MD` — 600px to 1199px
 * - `SM` — below 600px
 *
 * @usageNotes
 *
 * ### Exact match
 * ```ts
 * protected screen = inject(ScreenSizeService);
 * ```
 * ```html
 * @if (screen.size() === 'SM') {
 *   <mobile-layout />
 * }
 * ```
 *
 * ### Range comparison (using {@link AtLeastPipe} and {@link AtMostPipe})
 * ```html
 * @if (screen.size() | atLeast:'MD') {
 *   <desktop-layout />
 * }
 *
 * @if (screen.size() | atMost:'SM') {
 *   <mobile-nav />
 * }
 * ```
 */
@Injectable({
  providedIn: 'root',
})
export class ScreenSizeService {
  private readonly LG_BREAKPOINT = '(min-width: 1200px)';
  private readonly MD_BREAKPOINT = '(min-width: 600px)';

  private readonly _size = signal<ScreenSize>('LG');
  public readonly size = this._size.asReadonly();

  constructor(breakpointObserver: BreakpointObserver) {
    breakpointObserver
      .observe([this.LG_BREAKPOINT, this.MD_BREAKPOINT])
      .pipe(takeUntilDestroyed())
      .subscribe(breakpointState => {
        if (breakpointState.breakpoints[this.LG_BREAKPOINT]) {
          this._size.set('LG');
        } else if (breakpointState.breakpoints[this.MD_BREAKPOINT]) {
          this._size.set('MD');
        } else {
          this._size.set('SM');
        }
      });
  }
}
