import {
  afterNextRender,
  Component,
  computed,
  contentChildren,
  effect,
  ElementRef,
  input,
  signal,
  viewChild,
  ViewEncapsulation,
} from '@angular/core';
import { TableRowComponent } from '../table-row/table-row.component';
import { SvgComponent } from '../../svg/svg';
import { GhostButton } from '@design-system/lib/ds-button';

const TRANSITION_DURATION = 300;
const TRANSITION_BUFFER = 50;

@Component({
  selector: 'otp-table-section',
  templateUrl: './table-section.component.html',
  encapsulation: ViewEncapsulation.None,
  imports: [SvgComponent, GhostButton],
  host: {
    'role': 'rowgroup',
    '[style.display]': '"contents"',
    '[class.table-section]': 'true',
  },
})
export class TableSectionComponent {
  /** Section label (e.g., "Debit cards"). */
  readonly label = input.required<string>();

  /** Max rows shown before "Show more" appears. 0 = no limit. */
  readonly expandLimit = input(0);

  /** Whether the section is collapsed (header visible, rows hidden). */
  readonly collapsed = signal(false);

  /** Whether the section is showing all rows (past the expandLimit). */
  readonly expanded = signal(false);

  /** All TableRowComponent children projected into this section. */
  readonly rows = contentChildren(TableRowComponent);

  /** Whether an animation is currently in progress. */
  private readonly _animating = signal(false);

  /** Reference to the rows wrapper element. */
  private readonly _rowsWrapper =
    viewChild<ElementRef<HTMLDivElement>>('rowWrapper');

  /** Number of hidden rows when not expanded. */
  readonly hiddenCount = computed(() => {
    const limit = this.expandLimit();
    if (limit <= 0) return 0;
    return Math.max(0, this.rows().length - limit);
  });

  /** Whether "show more" button should appear. */
  readonly showMoreVisible = computed(
    () => !this.collapsed() && !this.expanded() && this.hiddenCount() > 0,
  );

  /** Whether "show less" button should appear. */
  readonly showLessVisible = computed(
    () => !this.collapsed() && this.expanded() && this.hiddenCount() > 0,
  );

  constructor() {
    // Apply row visibility for initial render and non-animated state changes
    // (e.g. expandLimit or rows change at runtime).
    effect(() => {
      const rows = this.rows();
      const limit = this.expandLimit();
      const isExpanded = this.expanded();
      const isCollapsed = this.collapsed();

      // During animation, visibility is managed by the animation methods.
      if (this._animating()) return;

      rows.forEach((row, index) => {
        if (isCollapsed) {
          row._hidden.set(true);
        } else if (limit > 0 && !isExpanded && index >= limit) {
          row._hidden.set(true);
        } else {
          row._hidden.set(false);
        }
      });
    });

    // Set initial max-height on the wrapper after first render.
    afterNextRender(() => {
      const wrapper = this._rowsWrapper()?.nativeElement;
      if (!wrapper) return;
      if (this.collapsed()) {
        wrapper.style.transition = 'none';
        wrapper.style.maxHeight = '0';
        // Restore transition on next frame
        requestAnimationFrame(() => (wrapper.style.transition = ''));
      }
    });
  }

  toggleCollapsed(): void {
    if (this._animating()) return;
    this._animating.set(true);

    const wrapper = this._rowsWrapper()?.nativeElement;
    if (!wrapper) {
      this.collapsed.update(v => !v);
      this._animating.set(false);
      return;
    }

    if (this.collapsed()) {
      this._animateSectionExpand(wrapper);
    } else {
      this._animateSectionCollapse(wrapper);
    }
  }

  toggleExpanded(): void {
    if (this._animating()) return;
    this._animating.set(true);

    const wrapper = this._rowsWrapper()?.nativeElement;
    if (!wrapper) {
      this.expanded.update(v => !v);
      this._animating.set(false);
      return;
    }

    if (this.expanded()) {
      this._animateCollapse(wrapper);
    } else {
      this._animateExpand(wrapper);
    }
  }

  /** Animate from limited rows to all rows ("Show more"). */
  private _animateExpand(wrapper: HTMLDivElement): void {
    const rows = this.rows();
    const limit = this.expandLimit();

    // 1. Capture current height
    const startHeight = wrapper.offsetHeight;

    // 2. Make overflow rows visible so they contribute to scrollHeight.
    //    Set the signal AND remove the class directly — Angular's change
    //    detection hasn't run yet, so the host binding won't update the DOM
    //    until the next CD cycle. We need the class gone now for measurement.
    rows.forEach((row, i) => {
      if (i >= limit) row._hidden.set(false);
    });
    this._removeHiddenClass(wrapper);

    // 3. Force reflow
    void wrapper.offsetHeight;

    // 4. Read target height
    const endHeight = wrapper.scrollHeight;

    // 5. Set starting max-height without transition
    wrapper.style.transition = 'none';
    wrapper.style.maxHeight = `${startHeight}px`;
    void wrapper.offsetHeight;

    // 6. Enable transition and animate to target
    wrapper.style.transition = '';
    wrapper.style.maxHeight = `${endHeight}px`;

    this._onTransitionEnd(wrapper, () => {
      wrapper.style.maxHeight = 'none';
      this.expanded.set(true);
      this._animating.set(false);
    });
  }

  /** Animate from all rows to limited rows ("Show less"). */
  private _animateCollapse(wrapper: HTMLDivElement): void {
    const rows = this.rows();
    const limit = this.expandLimit();

    // 1. Lock current height
    wrapper.style.transition = 'none';
    wrapper.style.maxHeight = `${wrapper.offsetHeight}px`;
    void wrapper.offsetHeight;

    // 2. Calculate target height (sum of first N grid row tracks)
    const targetHeight = this._measureLimitedHeight(wrapper, limit);

    // 3. Animate to target
    wrapper.style.transition = '';
    wrapper.style.maxHeight = `${targetHeight}px`;

    this._onTransitionEnd(wrapper, () => {
      // Hide overflow rows after animation completes
      rows.forEach((row, i) => {
        if (i >= limit) row._hidden.set(true);
      });
      wrapper.style.maxHeight = 'none';
      this.expanded.set(false);
      this._animating.set(false);
    });
  }

  /** Animate section collapse (all rows hidden). */
  private _animateSectionCollapse(wrapper: HTMLDivElement): void {
    const rows = this.rows();

    // 1. Lock current height
    wrapper.style.transition = 'none';
    wrapper.style.maxHeight = `${wrapper.offsetHeight}px`;
    void wrapper.offsetHeight;

    // 2. Animate to 0
    wrapper.style.transition = '';
    wrapper.style.maxHeight = '0';

    this._onTransitionEnd(wrapper, () => {
      rows.forEach(row => row._hidden.set(true));
      this.collapsed.set(true);
      this._animating.set(false);
    });
  }

  /** Animate section expand (from collapsed). */
  private _animateSectionExpand(wrapper: HTMLDivElement): void {
    const rows = this.rows();
    const limit = this.expandLimit();
    const isLimited = limit > 0 && !this.expanded();

    // 1. Make target rows visible (signal + direct DOM class removal)
    rows.forEach((row, i) => {
      if (isLimited && i >= limit) return;
      row._hidden.set(false);
    });
    this._removeHiddenClass(wrapper, isLimited ? limit : undefined);

    // 2. Start from 0 without transition
    wrapper.style.transition = 'none';
    wrapper.style.maxHeight = '0';
    void wrapper.offsetHeight;

    // 3. Read target height and animate
    const endHeight = wrapper.scrollHeight;
    wrapper.style.transition = '';
    wrapper.style.maxHeight = `${endHeight}px`;

    this._onTransitionEnd(wrapper, () => {
      wrapper.style.maxHeight = 'none';
      this.collapsed.set(false);
      this._animating.set(false);
    });
  }

  /**
   * Directly remove the hidden class from row elements so display:none lifts
   * immediately. When `upToIndex` is provided, only the first N rows are
   * unhidden — overflow rows keep their class.
   */
  private _removeHiddenClass(
    wrapper: HTMLDivElement,
    upToIndex?: number,
  ): void {
    wrapper.querySelectorAll('otp-table-row').forEach((el, i) => {
      if (upToIndex != null && i >= upToIndex) return;
      el.classList.remove('table-row-hidden');
    });
  }

  /** Measure the height of the first `limit` grid row tracks. */
  private _measureLimitedHeight(
    wrapper: HTMLDivElement,
    limit: number,
  ): number {
    const trackValues = getComputedStyle(wrapper).gridTemplateRows;
    const tracks = trackValues.split(/\s+/).map(v => parseFloat(v));
    return tracks.slice(0, limit).reduce((sum, h) => sum + h, 0);
  }

  /** Listen for transitionend with a fallback timeout. */
  private _onTransitionEnd(
    wrapper: HTMLDivElement,
    callback: () => void,
  ): void {
    let resolved = false;
    const resolve = () => {
      if (resolved) return;
      resolved = true;
      wrapper.removeEventListener('transitionend', handler);
      clearTimeout(fallback);
      callback();
    };
    const handler = (e: TransitionEvent) => {
      if (e.target === wrapper && e.propertyName === 'max-height') resolve();
    };
    wrapper.addEventListener('transitionend', handler);
    const fallback = setTimeout(
      resolve,
      TRANSITION_DURATION + TRANSITION_BUFFER,
    );
  }
}
