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
import { getYearRange, isYearDisabled } from '../date-utils';

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
  readonly pageChange = output<number>();

  readonly focusedYear = signal<number | null>(null);
  readonly pageOffset = signal(0);

  private readonly yearButtons = viewChildren<ElementRef<HTMLButtonElement>>('yearBtn');

  readonly range = computed(() => {
    const baseYear = this.activeDate().getFullYear();
    const { start } = getYearRange(baseYear);
    const offset = this.pageOffset() * 12;
    return {
      start: start + offset,
      end: start + offset + 11,
    };
  });

  readonly rangeLabel = computed(() => {
    const r = this.range();
    return `${r.start} – ${r.end}`;
  });

  readonly grid = computed((): number[][] => {
    const { start } = this.range();
    const rows: number[][] = [];
    for (let row = 0; row < 3; row++) {
      const cols: number[] = [];
      for (let col = 0; col < 4; col++) {
        cols.push(start + row * 4 + col);
      }
      rows.push(cols);
    }
    return rows;
  });

  isSelected(year: number): boolean {
    const sel = this.selected();
    return sel !== null && sel.getFullYear() === year;
  }

  isDisabled(year: number): boolean {
    return isYearDisabled(year, this.min(), this.max());
  }

  getTabIndex(year: number): number {
    const focused = this.focusedYear();
    if (focused !== null) return year === focused ? 0 : -1;

    const sel = this.selected();
    const r = this.range();
    if (sel && sel.getFullYear() >= r.start && sel.getFullYear() <= r.end) {
      return year === sel.getFullYear() ? 0 : -1;
    }
    const active = this.activeDate().getFullYear();
    if (active >= r.start && active <= r.end) {
      return year === active ? 0 : -1;
    }
    return year === r.start ? 0 : -1;
  }

  onYearClick(year: number): void {
    if (this.isDisabled(year)) return;
    this.yearSelected.emit(year);
  }

  prevPage(): void {
    this.pageOffset.update(v => v - 1);
    this.focusedYear.set(null);
  }

  nextPage(): void {
    this.pageOffset.update(v => v + 1);
    this.focusedYear.set(null);
  }

  onKeydown(event: KeyboardEvent): void {
    const r = this.range();
    const current = this.focusedYear() ?? this.activeDate().getFullYear();
    let next: number | null = null;

    switch (event.key) {
      case 'ArrowRight':
        next = current + 1;
        break;
      case 'ArrowLeft':
        next = current - 1;
        break;
      case 'ArrowDown':
        next = current + 4;
        break;
      case 'ArrowUp':
        next = current - 4;
        break;
      case 'Home':
        next = r.start;
        break;
      case 'End':
        next = r.end;
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

    if (next !== null) {
      if (next < r.start) {
        this.prevPage();
        this.focusedYear.set(next);
        queueMicrotask(() => this.focusYearButton(next!));
      } else if (next > r.end) {
        this.nextPage();
        this.focusedYear.set(next);
        queueMicrotask(() => this.focusYearButton(next!));
      } else {
        this.focusedYear.set(next);
        this.focusYearButton(next);
      }
    }
  }

  focusInitial(): void {
    const r = this.range();
    const active = this.activeDate().getFullYear();
    const target = (active >= r.start && active <= r.end) ? active : r.start;
    this.focusedYear.set(target);
    queueMicrotask(() => this.focusYearButton(target));
  }

  private focusYearButton(year: number): void {
    const r = this.range();
    const index = year - r.start;
    const buttons = this.yearButtons();
    if (index >= 0 && index < buttons.length) {
      buttons[index].nativeElement.focus();
    }
  }
}
