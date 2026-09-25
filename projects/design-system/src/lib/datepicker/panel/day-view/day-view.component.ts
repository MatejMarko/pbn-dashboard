import {
  afterRenderEffect,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  output,
  signal,
  viewChildren,
} from '@angular/core';
import { getMonthGrid, isSameDay, isSameMonth, isDateInRange, addMonths } from '../../date-utils';
import { DatepickerIntl } from '../../datepicker-intl';

@Component({
  selector: 'otp-day-view',
  templateUrl: './day-view.component.html',
  styleUrl: './day-view.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(keydown)': 'onKeydown($event)',
  },
})
export class DayViewComponent {
  readonly activeDate = input.required<Date>();
  readonly selected = input<Date | null>(null);
  readonly min = input<Date | null>(null);
  readonly max = input<Date | null>(null);
  readonly fixedWeeks = input(true);

  readonly dateSelected = output<Date>();
  readonly activeDateChange = output<Date>();

  readonly focusedDate = signal<Date | null>(null);

  private readonly intl = inject(DatepickerIntl);

  /** Weekday headers, Monday first: short label plus the full name for screen readers. */
  readonly weekdays = computed(() =>
    this.intl.weekdaysShort().map((short, i) => ({
      short,
      long: this.intl.weekdaysLong()[i],
    }))
  );

  readonly grid = computed(() => {
    const d = this.activeDate();
    return getMonthGrid(d.getFullYear(), d.getMonth());
  });

  readonly gridLabel = computed(() => this.intl.formatMonthYear(this.activeDate()));

  /**
   * Weeks actually rendered. With `fixedWeeks` off, a week made up entirely of
   * the neighbouring months' days is dropped, so February starting on a Monday
   * renders four rows and the panel shrinks to fit.
   */
  readonly weeks = computed(() => {
    const grid = this.grid();
    if (this.fixedWeeks()) return grid;

    return grid.filter(week => week.some(date => isSameMonth(date, this.activeDate())));
  });

  /**
   * Dates that render a button. With `fixedWeeks` off, days from the
   * neighbouring months leave an empty cell instead, so the grid keeps its
   * shape without offering days outside the month.
   */
  readonly visibleDates = computed(() =>
    this.weeks().flat().filter(date => this.isDateVisible(date))
  );

  /** The single day that carries `tabindex="0"`; it is always a rendered one. */
  readonly tabbableDate = computed(() => {
    const visible = this.visibleDates();
    const isRendered = (date: Date) => visible.some(d => isSameDay(d, date));

    const focused = this.focusedDate();
    if (focused && isRendered(focused)) return focused;

    const sel = this.selected();
    if (sel && isSameMonth(sel, this.activeDate()) && isRendered(sel)) return sel;

    if (isSameMonth(this.today, this.activeDate()) && isRendered(this.today)) return this.today;

    const active = this.activeDate();
    const firstOfMonth = new Date(active.getFullYear(), active.getMonth(), 1);
    return isRendered(firstOfMonth) ? firstOfMonth : visible[0] ?? null;
  });

  private readonly dayButtons = viewChildren<ElementRef<HTMLButtonElement>>('dayBtn');

  /** Date waiting to receive DOM focus once its button is on screen. */
  private readonly pendingFocus = signal<Date | null>(null);

  readonly today = new Date();

  constructor() {
    // Runs after the grid has rendered, so focus lands correctly even when the
    // keystroke moved the panel to another month.
    afterRenderEffect(() => {
      const target = this.pendingFocus();
      if (!target) return;

      const index = this.visibleDates().findIndex(date => isSameDay(date, target));
      const button = this.dayButtons()[index];
      if (button) {
        button.nativeElement.focus();
        this.pendingFocus.set(null);
      }
    });
  }

  isDateVisible(date: Date): boolean {
    return this.fixedWeeks() || isSameMonth(date, this.activeDate());
  }

  isCurrentMonth(date: Date): boolean {
    return isSameMonth(date, this.activeDate());
  }

  isSelected(date: Date): boolean {
    const sel = this.selected();
    return sel !== null && isSameDay(date, sel);
  }

  isToday(date: Date): boolean {
    return isSameDay(date, this.today);
  }

  isDisabled(date: Date): boolean {
    return !isDateInRange(date, this.min(), this.max());
  }

  /** Full, localized date used as the accessible name of a day cell. */
  dayLabel(date: Date): string {
    return this.intl.formatFullDate(date);
  }

  getTabIndex(date: Date): number {
    const tabbable = this.tabbableDate();
    return tabbable && isSameDay(date, tabbable) ? 0 : -1;
  }

  onDayClick(date: Date): void {
    if (this.isDisabled(date)) return;
    this.dateSelected.emit(date);
  }

  onKeydown(event: KeyboardEvent): void {
    const current = this.getFocusedOrDefault();
    let next: Date | null = null;

    switch (event.key) {
      case 'ArrowRight':
        next = this.addDays(current, 1);
        break;
      case 'ArrowLeft':
        next = this.addDays(current, -1);
        break;
      case 'ArrowDown':
        next = this.addDays(current, 7);
        break;
      case 'ArrowUp':
        next = this.addDays(current, -7);
        break;
      case 'Home':
        next = this.getStartOfWeek(current);
        break;
      case 'End':
        next = this.getEndOfWeek(current);
        break;
      case 'PageUp':
        next = event.shiftKey
          ? new Date(current.getFullYear() - 1, current.getMonth(), current.getDate())
          : addMonths(current, -1);
        break;
      case 'PageDown':
        next = event.shiftKey
          ? new Date(current.getFullYear() + 1, current.getMonth(), current.getDate())
          : addMonths(current, 1);
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (!this.isDisabled(current)) {
          this.dateSelected.emit(current);
        }
        return;
      default:
        return;
    }

    event.preventDefault();

    if (next) {
      // Moving out of the month asks the panel to switch; the focus request is
      // queued and applied once the new grid has rendered.
      if (!isSameMonth(next, this.activeDate())) {
        this.activeDateChange.emit(next);
      }
      this.focusedDate.set(next);
      this.pendingFocus.set(next);
    }
  }

  focusInitial(): void {
    const target = this.getFocusedOrDefault();
    this.focusedDate.set(target);
    this.pendingFocus.set(target);
  }

  private getFocusedOrDefault(): Date {
    const tabbable = this.tabbableDate();
    if (tabbable) return tabbable;

    const active = this.activeDate();
    return new Date(active.getFullYear(), active.getMonth(), 1);
  }

  private addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  private getStartOfWeek(date: Date): Date {
    const result = new Date(date);
    const day = result.getDay();
    const diff = day === 0 ? -6 : 1 - day; // Monday is start of week
    result.setDate(result.getDate() + diff);
    return result;
  }

  private getEndOfWeek(date: Date): Date {
    const result = new Date(date);
    const day = result.getDay();
    const diff = day === 0 ? 0 : 7 - day; // Sunday is end of week
    result.setDate(result.getDate() + diff);
    return result;
  }
}
