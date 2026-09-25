import { Component, signal, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { YearViewComponent } from './year-view.component';

@Component({
  template: `
    <otp-year-view
      [activeDate]="activeDate()"
      [selected]="selected()"
      [min]="min()"
      [max]="max()"
      (yearSelected)="onYearSelected($event)"
    />
  `,
  imports: [YearViewComponent],
})
class TestHost {
  readonly activeDate = signal(new Date(2026, 0, 15));
  readonly selected = signal<Date | null>(null);
  readonly min = signal<Date | null>(new Date(2020, 0, 1));
  readonly max = signal<Date | null>(new Date(2026, 11, 31));

  pickedYear: number | null = null;

  yearView = viewChild.required(YearViewComponent);

  onYearSelected(year: number): void {
    this.pickedYear = year;
  }
}

describe('YearViewComponent', () => {
  let fixture: ComponentFixture<TestHost>;
  let host: TestHost;

  function yearButtons(): HTMLButtonElement[] {
    return Array.from(fixture.nativeElement.querySelectorAll('.calendar-cell__button'));
  }

  function yearLabels(): string[] {
    return yearButtons().map(b => b.textContent!.trim());
  }

  function pressKey(key: string): void {
    fixture.nativeElement
      .querySelector('otp-year-view')
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

  it('should list years newest first, one per row', () => {
    expect(yearLabels()).toEqual(['2026', '2025', '2024', '2023', '2022', '2021', '2020']);

    const rows = fixture.nativeElement.querySelectorAll('tbody tr');
    expect(rows.length).toBe(7);
    expect(rows[0].querySelectorAll('td').length).toBe(1);
  });

  it('should bound the list by min and max', () => {
    host.min.set(new Date(2024, 0, 1));
    host.max.set(new Date(2027, 0, 1));
    fixture.detectChanges();

    expect(yearLabels()).toEqual(['2027', '2026', '2025', '2024']);
  });

  it('should default to the current year down to 2000', () => {
    host.min.set(null);
    host.max.set(null);
    fixture.detectChanges();

    const currentYear = new Date().getFullYear();
    expect(yearLabels()[0]).toBe(String(currentYear));
    expect(yearLabels().at(-1)).toBe('2000');
    expect(yearLabels().length).toBe(currentYear - 2000 + 1);
  });

  it('should widen the default range so the selected year stays reachable', () => {
    host.min.set(null);
    host.max.set(null);
    host.selected.set(new Date(1985, 5, 1));
    fixture.detectChanges();

    expect(yearLabels().at(-1)).toBe('1985');

    host.selected.set(new Date(2099, 5, 1));
    fixture.detectChanges();

    expect(yearLabels()[0]).toBe('2099');
  });

  it('should keep min and max as hard bounds even when a value sits outside', () => {
    host.min.set(new Date(2020, 0, 1));
    host.max.set(new Date(2026, 11, 31));
    host.selected.set(new Date(1985, 5, 1));
    fixture.detectChanges();

    expect(yearLabels()[0]).toBe('2026');
    expect(yearLabels().at(-1)).toBe('2020');
  });

  it('should render a scroll container instead of pagination', () => {
    expect(fixture.nativeElement.querySelector('.year-scroll')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.nav-button')).toBeNull();
  });

  it('should mark the year the header is showing, and today separately', () => {
    // activeDate is 2026, which is also the current year here.
    const marked = yearButtons().find(b => b.classList.contains('is-selected'));
    expect(marked?.textContent!.trim()).toBe('2026');
    expect(marked?.getAttribute('aria-current')).toBe('date');
  });

  it('should keep the mark on a year the user navigated to', () => {
    host.activeDate.set(new Date(2022, 0, 15));
    fixture.detectChanges();

    const marked = yearButtons().filter(b => b.classList.contains('is-selected'));
    expect(marked.map(b => b.textContent!.trim())).toEqual(['2022']);

    // Today's year is still flagged, just not as the chosen one.
    const current = yearButtons().find(
      b => b.textContent!.trim() === String(new Date().getFullYear())
    );
    expect(current?.classList.contains('is-today')).toBe(true);
    expect(current?.classList.contains('is-selected')).toBe(false);
  });

  it('should mark the header year on the cell', () => {
    host.activeDate.set(new Date(2022, 5, 1));
    fixture.detectChanges();

    const marked = Array.from(
      fixture.nativeElement.querySelectorAll('td[aria-selected="true"]')
    );
    expect(marked.length).toBe(1);
    expect((marked[0] as HTMLElement).textContent!.trim()).toBe('2022');
  });

  it('should use roving tabindex', () => {
    const tabbable = yearButtons().filter(b => b.getAttribute('tabindex') === '0');
    expect(tabbable.length).toBe(1);
    expect(tabbable[0].textContent!.trim()).toBe('2026');
  });

  it('should emit yearSelected on click', () => {
    yearButtons().find(b => b.textContent!.trim() === '2023')?.click();
    expect(host.pickedYear).toBe(2023);
  });

  it('should move down the list to older years with ArrowDown', () => {
    host.yearView().focusInitial();
    fixture.detectChanges();

    pressKey('ArrowDown');
    expect(host.yearView().focusedYear()).toBe(2025);

    pressKey('ArrowUp');
    expect(host.yearView().focusedYear()).toBe(2026);
  });

  it('should clamp keyboard navigation to the ends of the list', () => {
    host.yearView().focusInitial();
    fixture.detectChanges();

    pressKey('ArrowUp');
    expect(host.yearView().focusedYear()).toBe(2026);

    pressKey('End');
    expect(host.yearView().focusedYear()).toBe(2020);

    pressKey('PageDown');
    expect(host.yearView().focusedYear()).toBe(2020);

    pressKey('Home');
    expect(host.yearView().focusedYear()).toBe(2026);
  });

  it('should select the focused year on Enter', () => {
    host.yearView().focusInitial();
    fixture.detectChanges();

    pressKey('ArrowDown');
    pressKey('Enter');

    expect(host.pickedYear).toBe(2025);
  });
});
