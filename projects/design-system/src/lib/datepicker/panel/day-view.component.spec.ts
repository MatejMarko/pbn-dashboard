import { Component, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DayViewComponent } from './day-view.component';

@Component({
  template: `
    <otp-day-view
      [activeDate]="activeDate"
      [selected]="selected"
      [min]="min"
      [max]="max"
      (dateSelected)="onDateSelected($event)"
      (activeDateChange)="onActiveDateChange($event)"
    />
  `,
  imports: [DayViewComponent],
})
class TestHost {
  activeDate = new Date(2026, 0, 15); // January 2026
  selected: Date | null = null;
  min: Date | null = null;
  max: Date | null = null;
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

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHost],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHost);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should render a 6x7 grid of day buttons', () => {
    const buttons = fixture.nativeElement.querySelectorAll('button');
    expect(buttons.length).toBe(42);
  });

  it('should render weekday headers', () => {
    const headers = fixture.nativeElement.querySelectorAll('th');
    expect(headers.length).toBe(7);
    expect(headers[0].textContent.trim()).toBe('Mon');
  });

  it('should set role="grid" on the table', () => {
    const table = fixture.nativeElement.querySelector('table');
    expect(table.getAttribute('role')).toBe('grid');
  });

  it('should set aria-label to month and year', () => {
    const table = fixture.nativeElement.querySelector('table');
    expect(table.getAttribute('aria-label')).toBe('January 2026');
  });

  it('should mark selected date with aria-selected', () => {
    host.selected = new Date(2026, 0, 15);
    fixture.detectChanges();

    const buttons = fixture.nativeElement.querySelectorAll('button');
    const selectedButtons = Array.from(buttons).filter(
      (btn: any) => btn.getAttribute('aria-selected') === 'true'
    );
    expect(selectedButtons.length).toBe(1);
    expect((selectedButtons[0] as HTMLElement).textContent!.trim()).toBe('15');
  });

  it('should mark today with aria-current="date"', () => {
    const today = new Date();
    host.activeDate = today;
    fixture.detectChanges();

    const buttons = fixture.nativeElement.querySelectorAll('button');
    const todayButtons = Array.from(buttons).filter(
      (btn: any) => btn.getAttribute('aria-current') === 'date'
    );
    expect(todayButtons.length).toBe(1);
  });

  it('should disable dates outside min/max range', () => {
    host.min = new Date(2026, 0, 10);
    host.max = new Date(2026, 0, 20);
    fixture.detectChanges();

    const buttons: HTMLButtonElement[] = Array.from(
      fixture.nativeElement.querySelectorAll('button')
    );

    // Day 5 of January should be disabled
    const day5 = buttons.find(b => b.textContent!.trim() === '5' && !b.classList.contains('outside-month'));
    expect(day5?.disabled).toBe(true);
  });

  it('should use roving tabindex', () => {
    const buttons: HTMLButtonElement[] = Array.from(
      fixture.nativeElement.querySelectorAll('button')
    );
    const tabbable = buttons.filter(b => b.getAttribute('tabindex') === '0');
    expect(tabbable.length).toBe(1);
  });

  it('should emit dateSelected on day click', () => {
    const buttons: HTMLButtonElement[] = Array.from(
      fixture.nativeElement.querySelectorAll('button')
    );
    const day15 = buttons.find(
      b => b.textContent!.trim() === '15' && !b.classList.contains('outside-month')
    );
    day15?.click();
    expect(host.selectedDate?.getDate()).toBe(15);
  });

  it('should not emit dateSelected for disabled days', () => {
    host.min = new Date(2026, 0, 10);
    fixture.detectChanges();

    const buttons: HTMLButtonElement[] = Array.from(
      fixture.nativeElement.querySelectorAll('button')
    );
    const day5 = buttons.find(
      b => b.textContent!.trim() === '5' && !b.classList.contains('outside-month')
    );
    day5?.click();
    expect(host.selectedDate).toBeNull();
  });

  describe('keyboard navigation', () => {
    function pressKey(key: string, shiftKey = false): void {
      const el = fixture.nativeElement.querySelector('otp-day-view');
      el.dispatchEvent(new KeyboardEvent('keydown', { key, shiftKey, bubbles: true }));
      fixture.detectChanges();
    }

    beforeEach(() => {
      host.dayView().focusInitial();
      fixture.detectChanges();
    });

    it('should move focus with ArrowRight', () => {
      host.selected = new Date(2026, 0, 15);
      fixture.detectChanges();
      host.dayView().focusInitial();
      fixture.detectChanges();

      pressKey('ArrowRight');
      const focused = document.activeElement as HTMLElement;
      expect(focused?.textContent?.trim()).toBe('16');
    });

    it('should move focus with ArrowDown (next week)', () => {
      host.selected = new Date(2026, 0, 15);
      fixture.detectChanges();
      host.dayView().focusInitial();
      fixture.detectChanges();

      pressKey('ArrowDown');
      const focused = document.activeElement as HTMLElement;
      expect(focused?.textContent?.trim()).toBe('22');
    });

    it('should select date on Enter', () => {
      host.selected = new Date(2026, 0, 15);
      fixture.detectChanges();
      host.dayView().focusInitial();
      fixture.detectChanges();

      pressKey('Enter');
      expect(host.selectedDate?.getDate()).toBe(15);
    });

    it('should select date on Space', () => {
      host.selected = new Date(2026, 0, 15);
      fixture.detectChanges();
      host.dayView().focusInitial();
      fixture.detectChanges();

      pressKey(' ');
      expect(host.selectedDate?.getDate()).toBe(15);
    });
  });
});
