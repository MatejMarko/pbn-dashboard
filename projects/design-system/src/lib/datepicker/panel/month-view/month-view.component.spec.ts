import { Component, signal, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MonthViewComponent } from './month-view.component';

@Component({
  template: `
    <otp-month-view
      [activeDate]="activeDate()"
      [selected]="selected()"
      [min]="min()"
      [max]="max()"
      (monthSelected)="onMonthSelected($event)"
    />
  `,
  imports: [MonthViewComponent],
})
class TestHost {
  readonly activeDate = signal(new Date(2026, 5, 15)); // June 2026
  readonly selected = signal<Date | null>(null);
  readonly min = signal<Date | null>(null);
  readonly max = signal<Date | null>(null);

  pickedMonth: number | null = null;

  monthView = viewChild.required(MonthViewComponent);

  onMonthSelected(month: number): void {
    this.pickedMonth = month;
  }
}

describe('MonthViewComponent', () => {
  let fixture: ComponentFixture<TestHost>;
  let host: TestHost;

  function monthButtons(): HTMLButtonElement[] {
    return Array.from(fixture.nativeElement.querySelectorAll('.calendar-cell__button'));
  }

  function monthButton(label: string): HTMLButtonElement | undefined {
    return monthButtons().find(b => b.textContent!.trim() === label);
  }

  function pressKey(key: string): void {
    fixture.nativeElement
      .querySelector('otp-month-view')
      .dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
    fixture.detectChanges();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHost],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHost);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should render twelve months in a 3x4 grid', () => {
    expect(monthButtons().length).toBe(12);

    const rows = fixture.nativeElement.querySelectorAll('tbody tr');
    expect(rows.length).toBe(4);
    expect(rows[0].querySelectorAll('td').length).toBe(3);
  });

  it('should use localized short labels with full names for screen readers', () => {
    expect(monthButtons().map(b => b.textContent!.trim())).toEqual([
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ]);
    expect(monthButton('Jan')!.getAttribute('aria-label')).toBe('January');
  });

  it('should label the grid with the active year', () => {
    const table = fixture.nativeElement.querySelector('table');
    expect(table.getAttribute('aria-label')).toBe('2026');
  });

  it('should mark the current month only while its year is on screen', () => {
    const today = new Date();
    host.activeDate.set(new Date(today.getFullYear(), 5, 15));
    fixture.detectChanges();

    const currentLabel = monthButtons()[today.getMonth()];
    expect(currentLabel.classList.contains('is-today')).toBe(true);
    expect(currentLabel.classList.contains('is-selected')).toBe(false);

    // A different year: nothing is "current" there.
    host.activeDate.set(new Date(today.getFullYear() - 3, 5, 15));
    fixture.detectChanges();

    expect(monthButtons().filter(b => b.classList.contains('is-today')).length).toBe(0);
  });

  it('should mark the month the header is showing', () => {
    // activeDate is June 2026.
    const marked = Array.from(
      fixture.nativeElement.querySelectorAll('td[aria-selected="true"]')
    );
    expect(marked.length).toBe(1);
    expect((marked[0] as HTMLElement).textContent!.trim()).toBe('Jun');
  });

  it('should keep the mark on a month the user navigated to', () => {
    // Picking August moves the header, and the month view has to remember it
    // even though no full date has been chosen yet.
    host.activeDate.set(new Date(2026, 7, 15));
    fixture.detectChanges();

    const marked = monthButtons().filter(b => b.classList.contains('is-selected'));
    expect(marked.map(b => b.textContent!.trim())).toEqual(['Aug']);
  });

  it('should always mark exactly one month', () => {
    host.selected.set(new Date(2025, 2, 10));
    fixture.detectChanges();

    // The value's year is not on screen, but the header's month still is.
    expect(fixture.nativeElement.querySelectorAll('td[aria-selected="true"]').length).toBe(1);
  });

  it('should mark months outside min/max as aria-disabled', () => {
    host.min.set(new Date(2026, 3, 1)); // April 2026
    fixture.detectChanges();

    expect(monthButton('Mar')!.getAttribute('aria-disabled')).toBe('true');
    expect(monthButton('Apr')!.hasAttribute('aria-disabled')).toBe(false);
  });

  it('should use roving tabindex on the active month', () => {
    const tabbable = monthButtons().filter(b => b.getAttribute('tabindex') === '0');
    expect(tabbable.length).toBe(1);
    expect(tabbable[0].textContent!.trim()).toBe('Jun');
  });

  it('should emit monthSelected on click', () => {
    monthButton('Sep')!.click();
    expect(host.pickedMonth).toBe(8);
  });

  it('should not emit for a disabled month', () => {
    host.min.set(new Date(2026, 3, 1));
    fixture.detectChanges();

    monthButton('Feb')!.click();
    expect(host.pickedMonth).toBeNull();
  });

  describe('keyboard navigation', () => {
    beforeEach(() => {
      host.monthView().focusInitial();
      fixture.detectChanges();
    });

    it('should move one month with ArrowRight and ArrowLeft', () => {
      pressKey('ArrowRight');
      expect(host.monthView().focusedMonth()).toBe(6);

      pressKey('ArrowLeft');
      expect(host.monthView().focusedMonth()).toBe(5);
    });

    it('should move a row with ArrowDown and ArrowUp', () => {
      pressKey('ArrowDown');
      expect(host.monthView().focusedMonth()).toBe(8);

      pressKey('ArrowUp');
      expect(host.monthView().focusedMonth()).toBe(5);
    });

    it('should clamp at both ends of the year', () => {
      pressKey('Home');
      expect(host.monthView().focusedMonth()).toBe(0);

      pressKey('ArrowLeft');
      expect(host.monthView().focusedMonth()).toBe(0);

      pressKey('End');
      expect(host.monthView().focusedMonth()).toBe(11);

      pressKey('ArrowDown');
      expect(host.monthView().focusedMonth()).toBe(11);
    });

    it('should select the focused month on Enter and Space', () => {
      pressKey('Enter');
      expect(host.pickedMonth).toBe(5);

      host.pickedMonth = null;
      pressKey('ArrowRight');
      pressKey(' ');
      expect(host.pickedMonth).toBe(6);
    });

    it('should not select a disabled month with Enter', () => {
      host.min.set(new Date(2026, 8, 1)); // September 2026
      fixture.detectChanges();

      pressKey('Enter'); // focus is still on June
      expect(host.pickedMonth).toBeNull();
    });
  });
});
