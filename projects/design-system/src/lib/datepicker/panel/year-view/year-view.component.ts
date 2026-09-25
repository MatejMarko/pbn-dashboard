import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  input,
  output,
  signal,
  viewChildren,
} from '@angular/core';
import { isYearDisabled } from '../../date-utils';

/** Oldest year listed when no `min` is given. */
const DEFAULT_OLDEST_YEAR = 2000;

/** Years stepped over by PageUp / PageDown. */
const PAGE_STEP = 12;

@Component({
  selector: 'otp-year-view',
  templateUrl: './year-view.component.html',
  styleUrl: './year-view.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(keydown)': 'onKeydown($event)',
  },
})
export class YearViewComponent {
  readonly activeDate = input.required<Date>();
  readonly selected = input<Date | null>(null);
  readonly min = input<Date | null>(null);
  readonly max = input<Date | null>(null);

  readonly yearSelected = output<number>();

  readonly focusedYear = signal<number | null>(null);

  private readonly yearButtons = viewChildren<ElementRef<HTMLButtonElement>>('yearBtn');

  private readonly currentYear = new Date().getFullYear();

  /**
   * Newest year first, so the list reads downwards into the past.
   *
   * `min`/`max` are hard bounds when given. Without them the list runs from the
   * current year back to {@link DEFAULT_OLDEST_YEAR}, widened where needed so
   * the selected year is always reachable.
   */
  readonly years = computed(() => {
    const max = this.max();
    const min = this.min();
    const selectedYear = this.selected()?.getFullYear();

    const newest = max
      ? max.getFullYear()
      : Math.max(this.currentYear, selectedYear ?? this.currentYear);
    const oldest = min
      ? min.getFullYear()
      : Math.min(DEFAULT_OLDEST_YEAR, selectedYear ?? DEFAULT_OLDEST_YEAR);

    const list: number[] = [];
    for (let year = newest; year >= oldest; year--) {
      list.push(year);
    }
    return list;
  });

  readonly rangeLabel = computed(() => {
    const years = this.years();
    if (years.length === 0) return '';
    return `${years[years.length - 1]} – ${years[0]}`;
  });

  /**
   * The year the header is showing, which is either the value's year or the one
   * the user navigated to. It carries the pill, so the choice sticks.
   */
  isSelected(year: number): boolean {
    return year === this.activeDate().getFullYear();
  }

  /**
   * The year we are in, marked the way the day grid marks today, so the list is
   * never completely flat when nothing has been picked yet.
   */
  isCurrent(year: number): boolean {
    return year === this.currentYear;
  }

  isDisabled(year: number): boolean {
    return isYearDisabled(year, this.min(), this.max());
  }

  getTabIndex(year: number): number {
    const focused = this.focusedYear();
    if (focused !== null) return year === focused ? 0 : -1;

    return year === this.initialYear() ? 0 : -1;
  }

  onYearClick(year: number): void {
    if (this.isDisabled(year)) return;
    this.yearSelected.emit(year);
  }

  onKeydown(event: KeyboardEvent): void {
    const current = this.focusedYear() ?? this.initialYear();
    const years = this.years();
    let next: number | null = null;

    switch (event.key) {
      // The list runs newest first, so moving up goes to a later year.
      case 'ArrowUp':
        next = current + 1;
        break;
      case 'ArrowDown':
        next = current - 1;
        break;
      case 'PageUp':
        next = current + PAGE_STEP;
        break;
      case 'PageDown':
        next = current - PAGE_STEP;
        break;
      case 'Home':
        next = years[0];
        break;
      case 'End':
        next = years[years.length - 1];
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (!this.isDisabled(current)) {
          this.yearSelected.emit(current);
        }
        return;
      default:
        return;
    }

    event.preventDefault();

    const clamped = this.clampToList(next);
    if (clamped === null) return;

    this.focusedYear.set(clamped);
    this.focusYearButton(clamped);
  }

  focusInitial(): void {
    const target = this.focusedYear() ?? this.initialYear();
    this.focusedYear.set(target);
    queueMicrotask(() => this.focusYearButton(target, 'center'));
  }

  /** Year that carries the roving tabindex before the user moves around. */
  private initialYear(): number {
    const years = this.years();

    const active = this.activeDate().getFullYear();
    if (years.includes(active)) return active;

    return years[0];
  }

  private clampToList(year: number): number | null {
    const years = this.years();
    if (years.length === 0) return null;

    const newest = years[0];
    const oldest = years[years.length - 1];
    return Math.min(newest, Math.max(oldest, year));
  }

  private focusYearButton(year: number, block: ScrollLogicalPosition = 'nearest'): void {
    const index = this.years().indexOf(year);
    const buttons = this.yearButtons();

    if (index >= 0 && buttons[index]) {
      const element = buttons[index].nativeElement;
      element.focus({ preventScroll: true });
      // Not implemented in every test environment.
      element.scrollIntoView?.({ block });
    }
  }
}
