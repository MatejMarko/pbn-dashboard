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
import { getMonthGrid, isSameDay, isSameMonth, isDateInRange, addMonths } from '../date-utils';

const WEEKDAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

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

  readonly weekdays = WEEKDAY_LABELS;

  readonly grid = computed(() => {
    const d = this.activeDate();
    return getMonthGrid(d.getFullYear(), d.getMonth());
  });

  readonly gridLabel = computed(() => {
    const d = this.activeDate();
    return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  });

  private readonly dayButtons = viewChildren<ElementRef<HTMLButtonElement>>('dayBtn');

  readonly today = new Date();

  isFillerWeek(week: Date[]): boolean {
    return !this.fixedWeeks() && week.every(d => !isSameMonth(d, this.activeDate()));
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

  getTabIndex(date: Date): number {
    const focused = this.focusedDate();
    if (focused) {
      return isSameDay(date, focused) ? 0 : -1;
    }
    const sel = this.selected();
    if (sel && isSameMonth(sel, this.activeDate())) {
      return isSameDay(date, sel) ? 0 : -1;
    }
    if (isSameMonth(this.today, this.activeDate())) {
      return isSameDay(date, this.today) ? 0 : -1;
    }
    // Default: first day of month
    return date.getDate() === 1 && this.isCurrentMonth(date) ? 0 : -1;
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
      if (!isSameMonth(next, this.activeDate())) {
        this.activeDateChange.emit(next);
      }
      this.focusedDate.set(next);
      this.focusDayButton(next);
    }
  }

  focusInitial(): void {
    const target = this.getFocusedOrDefault();
    this.focusedDate.set(target);
    // Defer to next microtask so buttons are rendered
    queueMicrotask(() => this.focusDayButton(target));
  }

  private getFocusedOrDefault(): Date {
    const focused = this.focusedDate();
    if (focused) return focused;

    const sel = this.selected();
    if (sel && isSameMonth(sel, this.activeDate())) return sel;

    if (isSameMonth(this.today, this.activeDate())) return this.today;

    return new Date(this.activeDate().getFullYear(), this.activeDate().getMonth(), 1);
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

  private focusDayButton(date: Date): void {
    const buttons = this.dayButtons();
    const flatGrid = this.grid().flat();
    const index = flatGrid.findIndex(d => isSameDay(d, date));
    if (index >= 0 && buttons[index]) {
      buttons[index].nativeElement.focus();
    }
  }
}
