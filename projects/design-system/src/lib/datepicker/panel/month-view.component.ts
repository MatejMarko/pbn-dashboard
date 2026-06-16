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
import { isMonthDisabled } from '../date-utils';

const MONTH_LABELS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

@Component({
  selector: 'otp-month-view',
  templateUrl: './month-view.component.html',
  styleUrl: './month-view.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(keydown)': 'onKeydown($event)',
  },
})
export class MonthViewComponent {
  readonly activeDate = input.required<Date>();
  readonly selected = input<Date | null>(null);
  readonly min = input<Date | null>(null);
  readonly max = input<Date | null>(null);

  readonly monthSelected = output<number>();

  readonly focusedMonth = signal<number | null>(null);

  private readonly monthButtons = viewChildren<ElementRef<HTMLButtonElement>>('monthBtn');

  readonly grid = computed((): { label: string; month: number }[][] => {
    const rows: { label: string; month: number }[][] = [];
    for (let row = 0; row < 4; row++) {
      const cols: { label: string; month: number }[] = [];
      for (let col = 0; col < 3; col++) {
        const month = row * 3 + col;
        cols.push({ label: MONTH_LABELS[month], month });
      }
      rows.push(cols);
    }
    return rows;
  });

  readonly gridLabel = computed(() => {
    return this.activeDate().getFullYear().toString();
  });

  isSelected(month: number): boolean {
    const sel = this.selected();
    return sel !== null
      && sel.getFullYear() === this.activeDate().getFullYear()
      && sel.getMonth() === month;
  }

  isDisabled(month: number): boolean {
    return isMonthDisabled(this.activeDate().getFullYear(), month, this.min(), this.max());
  }

  getTabIndex(month: number): number {
    const focused = this.focusedMonth();
    if (focused !== null) return month === focused ? 0 : -1;

    const sel = this.selected();
    if (sel && sel.getFullYear() === this.activeDate().getFullYear()) {
      return month === sel.getMonth() ? 0 : -1;
    }
    return month === this.activeDate().getMonth() ? 0 : -1;
  }

  onMonthClick(month: number): void {
    if (this.isDisabled(month)) return;
    this.monthSelected.emit(month);
  }

  onKeydown(event: KeyboardEvent): void {
    const current = this.focusedMonth() ?? this.activeDate().getMonth();
    let next: number | null = null;

    switch (event.key) {
      case 'ArrowRight':
        next = Math.min(current + 1, 11);
        break;
      case 'ArrowLeft':
        next = Math.max(current - 1, 0);
        break;
      case 'ArrowDown':
        next = Math.min(current + 3, 11);
        break;
      case 'ArrowUp':
        next = Math.max(current - 3, 0);
        break;
      case 'Home':
        next = 0;
        break;
      case 'End':
        next = 11;
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (!this.isDisabled(current)) {
          this.monthSelected.emit(current);
        }
        return;
      default:
        return;
    }

    event.preventDefault();
    this.focusedMonth.set(next);
    this.focusMonthButton(next);
  }

  focusInitial(): void {
    const target = this.focusedMonth() ?? this.activeDate().getMonth();
    this.focusedMonth.set(target);
    queueMicrotask(() => this.focusMonthButton(target));
  }

  private focusMonthButton(month: number): void {
    const buttons = this.monthButtons();
    if (buttons[month]) {
      buttons[month].nativeElement.focus();
    }
  }
}
