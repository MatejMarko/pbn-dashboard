import { Component, signal, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DayViewComponent } from './day-view.component';

@Component({
  template: `
    <otp-day-view
      [activeDate]="activeDate()"
      [selected]="selected()"
      [min]="min()"
      [max]="max()"
      [fixedWeeks]="fixedWeeks()"
      (dateSelected)="onDateSelected($event)"
      (activeDateChange)="onActiveDateChange($event)"
    />
  `,
  imports: [DayViewComponent],
})
class TestHost {
  readonly activeDate = signal(new Date(2026, 0, 15)); // January 2026
  readonly selected = signal<Date | null>(null);
  readonly min = signal<Date | null>(null);
  readonly max = signal<Date | null>(null);
  readonly fixedWeeks = signal(true);

  selectedDate: Date | null = null;
  newActiveDate: Date | null = null;

  dayView = viewChild.required(DayViewComponent);

  onDateSelected(date: Date): void {
    this.selectedDate = date;
  }

  onActiveDateChange(date: Date): void {
    this.newActiveDate = date;
  }
}

describe('DayViewComponent', () => {
  let fixture: ComponentFixture<TestHost>;
  let host: TestHost;

  function dayButtons(): HTMLButtonElement[] {
    return Array.from(fixture.nativeElement.querySelectorAll('.calendar-cell__button'));
  }

  function dayButton(text: string): HTMLButtonElement | undefined {
    return dayButtons().find(
      b => b.textContent!.trim() === text && !b.classList.contains('is-outside')
    );
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHost],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHost);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should render a 6x7 grid of day buttons', () => {
    expect(dayButtons().length).toBe(42);
  });

  it('should render weekday headers', () => {
    const headers = fixture.nativeElement.querySelectorAll('th');
    expect(headers.length).toBe(7);
    expect(
      Array.from(headers).map((th: any) => th.textContent.trim())
    ).toEqual(['M', 'Tu', 'W', 'Th', 'F', 'Sa', 'Su']);
    expect(headers[0].getAttribute('abbr')).toBe('Monday');
  });

  it('should set role="grid" on the table', () => {
    const table = fixture.nativeElement.querySelector('table');
    expect(table.getAttribute('role')).toBe('grid');
  });

  it('should set aria-label to month and year', () => {
    const table = fixture.nativeElement.querySelector('table');
    expect(table.getAttribute('aria-label')).toBe('January 2026');
  });

  it('should give each day a full accessible name', () => {
    expect(dayButton('15')?.getAttribute('aria-label')).toBe('Thursday, 15 January 2026');
  });

  it('should mark the selected cell with aria-selected', () => {
    host.selected.set(new Date(2026, 0, 15));
    fixture.detectChanges();

    const selectedCells = Array.from(
      fixture.nativeElement.querySelectorAll('td[aria-selected="true"]')
    );
    expect(selectedCells.length).toBe(1);
    expect((selectedCells[0] as HTMLElement).textContent!.trim()).toBe('15');
  });

  it('should mark today with aria-current="date"', () => {
    host.activeDate.set(new Date());
    fixture.detectChanges();

    const todayButtons = dayButtons().filter(b => b.getAttribute('aria-current') === 'date');
    expect(todayButtons.length).toBe(1);
  });

  it('should mark dates outside min/max as aria-disabled but keep them focusable', () => {
    host.min.set(new Date(2026, 0, 10));
    host.max.set(new Date(2026, 0, 20));
    fixture.detectChanges();

    const day5 = dayButton('5');
    expect(day5?.getAttribute('aria-disabled')).toBe('true');
    expect(day5?.classList.contains('is-disabled')).toBe(true);
    // Native `disabled` would take the cell out of the roving tabindex order.
    expect(day5?.disabled).toBe(false);
  });

  it('should use roving tabindex', () => {
    const tabbable = dayButtons().filter(b => b.getAttribute('tabindex') === '0');
    expect(tabbable.length).toBe(1);
  });

  it('should emit dateSelected on day click', () => {
    dayButton('15')?.click();
    expect(host.selectedDate?.getDate()).toBe(15);
  });

  it('should not emit dateSelected for disabled days', () => {
    host.min.set(new Date(2026, 0, 10));
    fixture.detectChanges();

    dayButton('5')?.click();
    expect(host.selectedDate).toBeNull();
  });

  describe('fixedWeeks: false', () => {
    beforeEach(() => {
      host.fixedWeeks.set(false);
      fixture.detectChanges();
    });

    it('should render only the days of the active month', () => {
      // January 2026 has 31 days.
      expect(dayButtons().length).toBe(31);
      expect(dayButtons().map(b => b.textContent!.trim())).toEqual(
        Array.from({ length: 31 }, (_, i) => String(i + 1))
      );
    });

    it('should render only the weeks the month occupies', () => {
      // January 2026 spans 5 weeks; the empty sixth is not rendered at all, so
      // the panel can shrink to fit.
      expect(fixture.nativeElement.querySelectorAll('tbody tr').length).toBe(5);
    });

    it('should leave empty, non-interactive cells in place of adjacent-month days', () => {
      const cells = fixture.nativeElement.querySelectorAll('td.calendar-cell');
      expect(cells.length).toBe(35);

      // January 2026 starts on a Thursday, so the first three cells are empty.
      const emptyLeading = Array.from(cells).slice(0, 3) as HTMLElement[];
      for (const cell of emptyLeading) {
        expect(cell.querySelector('button')).toBeNull();
        expect(cell.textContent!.trim()).toBe('');
        expect(cell.hasAttribute('aria-selected')).toBe(false);
      }
    });

    it('should keep a single tabbable day inside the month', () => {
      const tabbable = dayButtons().filter(b => b.getAttribute('tabindex') === '0');
      expect(tabbable.length).toBe(1);
      expect(tabbable[0].classList.contains('is-outside')).toBe(false);
    });

    it('should still show adjacent-month days when fixedWeeks is true', () => {
      host.fixedWeeks.set(true);
      fixture.detectChanges();

      expect(dayButtons().length).toBe(42);
      expect(fixture.nativeElement.querySelectorAll('tbody tr').length).toBe(6);
    });

    it('should render four rows for a month that fits in four weeks', () => {
      // February 2026 has 28 days and starts on a Sunday, so it spans 5 weeks;
      // March 2027 (31 days, starts Monday) is the 5-week case. Use a month
      // that genuinely fits four: February 2021 starts on a Monday.
      host.activeDate.set(new Date(2021, 1, 15));
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelectorAll('tbody tr').length).toBe(4);
      expect(dayButtons().length).toBe(28);
    });
  });

  describe('keyboard navigation', () => {
    function pressKey(key: string, shiftKey = false): void {
      const el = fixture.nativeElement.querySelector('otp-day-view');
      el.dispatchEvent(new KeyboardEvent('keydown', { key, shiftKey, bubbles: true }));
      fixture.detectChanges();
    }

    beforeEach(() => {
      host.selected.set(new Date(2026, 0, 15));
      fixture.detectChanges();
      host.dayView().focusInitial();
      fixture.detectChanges();
    });

    it('should move focus with ArrowRight', () => {
      pressKey('ArrowRight');
      expect((document.activeElement as HTMLElement)?.textContent?.trim()).toBe('16');
    });

    it('should move focus with ArrowDown (next week)', () => {
      pressKey('ArrowDown');
      expect((document.activeElement as HTMLElement)?.textContent?.trim()).toBe('22');
    });

    it('should select date on Enter', () => {
      pressKey('Enter');
      expect(host.selectedDate?.getDate()).toBe(15);
    });

    it('should select date on Space', () => {
      pressKey(' ');
      expect(host.selectedDate?.getDate()).toBe(15);
    });

    it('should ask the panel to switch months when moving past the end', () => {
      host.dayView().focusedDate.set(new Date(2026, 0, 31));
      fixture.detectChanges();

      pressKey('ArrowRight');

      expect(host.newActiveDate?.getMonth()).toBe(1); // February
      expect(host.newActiveDate?.getDate()).toBe(1);
    });

    it('should ask the panel to switch months on PageDown', () => {
      pressKey('PageDown');

      expect(host.newActiveDate?.getMonth()).toBe(1);
      expect(host.dayView().focusedDate()?.getDate()).toBe(15);
    });
  });
});
