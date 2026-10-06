import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { DATEPICKER_DATA, DatepickerData } from '../datepicker-context';
import { DatepickerPanelComponent } from './datepicker-panel.component';
import { provideMockSvg } from '../../../test-utils/mock-svg';

describe('DatepickerPanelComponent', () => {
  let fixture: ComponentFixture<DatepickerPanelComponent>;
  let component: DatepickerPanelComponent;
  let data: DatepickerData;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let closeSpy: any;

  beforeEach(async () => {
    closeSpy = vi.fn();

    data = {
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

  it('should show day, month and year as separate header segments', () => {
    expect(component.headerDay()).toBe('15');
    expect(component.headerMonth()).toBe('January');
    expect(component.headerYear()).toBe('2026');

    const segments: HTMLButtonElement[] = Array.from(
      fixture.nativeElement.querySelectorAll('.header-segment')
    );
    expect(segments.map(s => s.textContent!.trim())).toEqual(['15', 'January', '2026']);
  });

  describe('the day segment', () => {
    function daySegment(): HTMLButtonElement {
      return fixture.nativeElement.querySelector('.header-segment--day');
    }

    function showsIcon(): boolean {
      return !!daySegment().querySelector('otp-svg');
    }

    it('should show a day only while the month holding the value is on screen', () => {
      expect(component.showDay()).toBe(true);
      expect(daySegment().textContent!.trim()).toBe('15');
      expect(showsIcon()).toBe(false);
    });

    it('should show the calendar icon when nothing has been chosen', () => {
      data.selected.set(null);
      fixture.detectChanges();

      expect(component.showDay()).toBe(false);
      expect(showsIcon()).toBe(true);
      expect(daySegment().textContent!.trim()).toBe('');
    });

    it('should swap the day for the icon once the month changes', () => {
      component.onMonthSelected(7); // August; the value is in January
      fixture.detectChanges();

      expect(showsIcon()).toBe(true);
    });

    it('should swap the day for the icon once the year changes', () => {
      component.onYearSelected(2030);
      fixture.detectChanges();

      expect(showsIcon()).toBe(true);
    });

    it('should bring the day back when the value\'s month is shown again', () => {
      component.onMonthSelected(7);
      fixture.detectChanges();
      expect(showsIcon()).toBe(true);

      component.onMonthSelected(0); // back to January 2026
      fixture.detectChanges();

      expect(daySegment().textContent!.trim()).toBe('15');
      expect(showsIcon()).toBe(false);
    });

    it('should still open the day view while showing the icon', () => {
      data.selected.set(null);
      component.setView('year');
      fixture.detectChanges();

      daySegment().click();
      fixture.detectChanges();

      expect(component.currentView()).toBe('day');
    });
  });

  describe('the month cursor', () => {
    it('should keep the first of the month, so a 31st cannot overflow', () => {
      data.selected.set(new Date(2026, 2, 31)); // 31 March
      fixture = TestBed.createComponent(DatepickerPanelComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      component.onMonthSelected(3); // April has 30 days

      expect(component.activeDate().getMonth()).toBe(3);
      expect(component.activeDate().getDate()).toBe(1);
    });

    it('should not trip over a leap day when the year changes', () => {
      data.selected.set(new Date(2024, 1, 29)); // 29 February 2024
      fixture = TestBed.createComponent(DatepickerPanelComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      component.onYearSelected(2025); // 2025 has no 29 February

      expect(component.activeDate().getFullYear()).toBe(2025);
      expect(component.activeDate().getMonth()).toBe(1);
      expect(component.activeDate().getDate()).toBe(1);
    });
  });

  it('should switch to month view on the month segment click', () => {
    const monthSegment: HTMLButtonElement =
      fixture.nativeElement.querySelector('.header-segment--month');
    monthSegment.click();
    fixture.detectChanges();

    expect(component.currentView()).toBe('month');
    expect(fixture.nativeElement.querySelector('otp-month-view')).toBeTruthy();
  });

  it('should switch to year view on the year segment click without picking a month first', () => {
    const yearSegment: HTMLButtonElement =
      fixture.nativeElement.querySelector('.header-segment--year');
    yearSegment.click();
    fixture.detectChanges();

    expect(component.currentView()).toBe('year');
    expect(fixture.nativeElement.querySelector('otp-year-view')).toBeTruthy();
  });

  it('should switch back to day view on the day segment click', () => {
    component.setView('year');
    fixture.detectChanges();

    const daySegment: HTMLButtonElement =
      fixture.nativeElement.querySelector('.header-segment--day');
    daySegment.click();
    fixture.detectChanges();

    expect(component.currentView()).toBe('day');
    expect(fixture.nativeElement.querySelector('otp-day-view')).toBeTruthy();
  });

  it('should mark the active segment with a notch, and only that one', () => {
    const markers = () =>
      Array.from(fixture.nativeElement.querySelectorAll('.header-marker'));

    expect(markers().length).toBe(1);
    expect((markers()[0] as SVGElement).closest('.header-segment')!.classList)
      .toContain('header-segment--day');

    component.setView('year');
    fixture.detectChanges();

    expect(markers().length).toBe(1);
    expect((markers()[0] as SVGElement).closest('.header-segment')!.classList)
      .toContain('header-segment--year');
  });

  it('should mark the active view segment with aria-pressed', () => {
    const daySegment: HTMLButtonElement =
      fixture.nativeElement.querySelector('.header-segment--day');
    const yearSegment: HTMLButtonElement =
      fixture.nativeElement.querySelector('.header-segment--year');

    expect(daySegment.getAttribute('aria-pressed')).toBe('true');
    expect(yearSegment.getAttribute('aria-pressed')).toBe('false');
  });

  it('should go to month view after picking a year, keeping the month', () => {
    component.setView('year');
    fixture.detectChanges();

    component.onYearSelected(2030);
    fixture.detectChanges();

    expect(component.currentView()).toBe('month');
    expect(fixture.nativeElement.querySelector('otp-month-view')).toBeTruthy();
    expect(component.activeDate().getFullYear()).toBe(2030);
    expect(component.activeDate().getMonth()).toBe(0);
  });

  it('should return to day view after picking a month', () => {
    component.setView('month');
    fixture.detectChanges();

    component.onMonthSelected(5);
    fixture.detectChanges();

    expect(component.currentView()).toBe('day');
    expect(component.activeDate().getMonth()).toBe(5);
  });

  it('should keep the same body structure in every view', () => {
    for (const view of ['day', 'month', 'year'] as const) {
      component.setView(view);
      fixture.detectChanges();

      const body = fixture.nativeElement.querySelector('.datepicker-body');
      expect(body.querySelectorAll('.calendar-grid').length).toBe(1);
      expect(body.querySelectorAll('.calendar-cell__button').length).toBeGreaterThan(0);
    }
  });

  it('should not render navigation arrows', () => {
    expect(fixture.nativeElement.querySelector('.nav-button')).toBeNull();
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
