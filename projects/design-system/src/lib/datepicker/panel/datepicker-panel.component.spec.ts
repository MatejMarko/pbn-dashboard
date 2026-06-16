import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { DATEPICKER_DATA, DatepickerData } from '../datepicker-context';
import { DatepickerPanelComponent } from './datepicker-panel.component';
import { provideMockSvg } from '../../../test-utils/mock-svg';

describe('DatepickerPanelComponent', () => {
  let fixture: ComponentFixture<DatepickerPanelComponent>;
  let component: DatepickerPanelComponent;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let closeSpy: any;

  beforeEach(async () => {
    closeSpy = vi.fn();

    const data: DatepickerData = {
      selected: signal<Date | null>(new Date(2026, 0, 15)),
      min: signal<Date | null>(null),
      max: signal<Date | null>(null),
      fixedWeeks: signal(false),
      close: closeSpy,
    };

    await TestBed.configureTestingModule({
      imports: [DatepickerPanelComponent],
      providers: [
        { provide: DATEPICKER_DATA, useValue: data },
        provideMockSvg(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DatepickerPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should render with role="dialog"', () => {
    expect(fixture.nativeElement.getAttribute('role')).toBe('dialog');
  });

  it('should have aria-modal="true"', () => {
    expect(fixture.nativeElement.getAttribute('aria-modal')).toBe('true');
  });

  it('should start in day view', () => {
    expect(component.currentView()).toBe('day');
    expect(fixture.nativeElement.querySelector('otp-day-view')).toBeTruthy();
  });

  it('should show month and year in header label', () => {
    expect(component.headerLabel()).toBe('January 2026');
  });

  it('should switch to month view on header click', () => {
    const headerBtn: HTMLButtonElement = fixture.nativeElement.querySelector('.header-label');
    headerBtn.click();
    fixture.detectChanges();

    expect(component.currentView()).toBe('month');
    expect(fixture.nativeElement.querySelector('otp-month-view')).toBeTruthy();
  });

  it('should switch to year view from month view header click', () => {
    component.currentView.set('month');
    fixture.detectChanges();

    const headerBtn: HTMLButtonElement = fixture.nativeElement.querySelector('.header-label');
    headerBtn.click();
    fixture.detectChanges();

    expect(component.currentView()).toBe('year');
    expect(fixture.nativeElement.querySelector('otp-year-view')).toBeTruthy();
  });

  it('should not be clickable in year view header', () => {
    component.currentView.set('year');
    fixture.detectChanges();

    const headerBtn: HTMLButtonElement = fixture.nativeElement.querySelector('.header-label');
    expect(headerBtn.disabled).toBe(true);
  });

  it('should navigate to previous month on prev button click', () => {
    const prevBtn: HTMLButtonElement = fixture.nativeElement.querySelector('.nav-button');
    prevBtn.click();
    fixture.detectChanges();

    expect(component.activeDate().getMonth()).toBe(11); // December 2025
  });

  it('should navigate to next month on next button click', () => {
    const buttons: HTMLButtonElement[] = Array.from(
      fixture.nativeElement.querySelectorAll('.nav-button')
    );
    buttons[1].click();
    fixture.detectChanges();

    expect(component.activeDate().getMonth()).toBe(1); // February 2026
  });

  it('should close with selected date when day is clicked', () => {
    const dayButtons: HTMLButtonElement[] = Array.from(
      fixture.nativeElement.querySelectorAll('otp-day-view button')
    );
    const day20 = dayButtons.find(
      b => b.textContent!.trim() === '20' && !b.classList.contains('outside-month')
    );
    day20?.click();

    expect(closeSpy).toHaveBeenCalledWith(expect.objectContaining({
      getDate: expect.any(Function),
    }));
    const calledDate: Date = closeSpy.mock.calls[0][0];
    expect(calledDate.getDate()).toBe(20);
  });

  it('should close with null on Escape', () => {
    fixture.nativeElement.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })
    );

    expect(closeSpy).toHaveBeenCalledWith(null);
  });

  it('should have a live region for announcements', () => {
    const liveRegion = fixture.nativeElement.querySelector('[aria-live="polite"]');
    expect(liveRegion).toBeTruthy();
  });

  it('should have focus trap', () => {
    const trapEl = fixture.nativeElement.querySelector('[cdktrapfocus]');
    expect(trapEl).toBeTruthy();
  });
});
