import { Component, signal, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { CalendarComponent } from '../calendar/calendar.component';
import { DatepickerInputDirective } from './datepicker-input.directive';
import { DatepickerToggleDirective } from './datepicker-toggle.directive';
import { DatepickerRef } from '../datepicker-ref';
import { DatepickerService } from '../datepicker.service';

@Component({
  template: `
    <input [otpDatepickerInput]="picker" [formControl]="dateCtrl" />
    <button [otpDatepickerToggle]="picker">Open</button>
    <otp-calendar #picker
                  [min]="min()"
                  [max]="max()"
                  (dateSelected)="onDateSelected($event)" />
  `,
  imports: [
    ReactiveFormsModule,
    CalendarComponent,
    DatepickerInputDirective,
    DatepickerToggleDirective,
  ],
})
class Host {
  readonly min = signal<Date | null>(null);
  readonly max = signal<Date | null>(null);

  dateCtrl = new FormControl<string | Date | null>(null);
  selectedDate: Date | null = null;

  calendar = viewChild.required(CalendarComponent);

  onDateSelected(date: Date): void {
    this.selectedDate = date;
  }
}

describe('datepicker input / toggle', () => {
  let fixture: ComponentFixture<Host>;
  let host: Host;
  let closedSubject: Subject<Date | null>;
  let mockService: { open: ReturnType<typeof vi.fn> };
  let mockRefClose: ReturnType<typeof vi.fn>;

  function input(): HTMLInputElement {
    return fixture.nativeElement.querySelector('input');
  }

  function toggle(): HTMLButtonElement {
    return fixture.nativeElement.querySelector('button');
  }

  beforeEach(async () => {
    closedSubject = new Subject<Date | null>();
    mockRefClose = vi.fn();
    const mockRef = {
      afterClosed: () => closedSubject.asObservable(),
      close: mockRefClose,
    } as unknown as DatepickerRef;
    mockService = { open: vi.fn().mockReturnValue(mockRef) };

    await TestBed.configureTestingModule({
      imports: [Host],
      providers: [{ provide: DatepickerService, useValue: mockService }],
    }).compileComponents();

    fixture = TestBed.createComponent(Host);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('input', () => {
    it('should not open the calendar when the input is clicked', () => {
      input().click();
      fixture.detectChanges();

      expect(mockService.open).not.toHaveBeenCalled();
      expect(input().getAttribute('aria-expanded')).toBe('false');
    });

    it('should not open the calendar when the input is focused', () => {
      input().focus();
      fixture.detectChanges();

      expect(mockService.open).not.toHaveBeenCalled();
    });

    it('should open on Alt+ArrowDown', () => {
      input().dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowDown', altKey: true, bubbles: true })
      );
      fixture.detectChanges();

      expect(mockService.open).toHaveBeenCalledTimes(1);
      expect(input().getAttribute('aria-expanded')).toBe('true');
    });

    it('should set aria-haspopup and autocomplete', () => {
      expect(input().getAttribute('aria-haspopup')).toBe('dialog');
      expect(input().getAttribute('autocomplete')).toBe('off');
    });

    it('should parse typed text into the form control as an ISO string', () => {
      input().value = '15.01.2026';
      input().dispatchEvent(new Event('input'));

      expect(host.dateCtrl.value).toMatch(/^2026-01-15T00:00:00\.000[+-]\d{2}:\d{2}$/);
    });

    it('should leave the typed text alone', () => {
      input().value = '16.04.2026';
      input().dispatchEvent(new Event('input'));
      fixture.detectChanges();

      // Padded input is valid and is not rewritten mid-typing; blur normalizes.
      expect(input().value).toBe('16.04.2026');
    });

    it('should be the only value accessor on the element', () => {
      // A second accessor would fight over the text; see writeValue().
      expect(input().value).toBe('');

      host.dateCtrl.setValue(new Date(2026, 3, 16));
      fixture.detectChanges();

      expect(input().value).toBe('16.4.2026');
    });

    it('should format values written from code', () => {
      host.dateCtrl.patchValue(new Date(2026, 0, 5));
      fixture.detectChanges();
      expect(input().value).toBe('5.1.2026');

      host.dateCtrl.reset();
      fixture.detectChanges();
      expect(input().value).toBe('');
      expect(host.dateCtrl.value).toBeNull();
    });

    it('should clear the control when the field is emptied', () => {
      input().value = '15.01.2026';
      input().dispatchEvent(new Event('input'));
      input().value = '';
      input().dispatchEvent(new Event('input'));

      expect(host.dateCtrl.value).toBeNull();
      expect(host.dateCtrl.errors).toBeNull();
    });

    it('should mark the control touched on blur', () => {
      expect(host.dateCtrl.touched).toBe(false);

      input().dispatchEvent(new Event('blur'));

      expect(host.dateCtrl.touched).toBe(true);
    });

    it('should disable the element when the control is disabled', () => {
      host.dateCtrl.disable();
      fixture.detectChanges();

      expect(input().disabled).toBe(true);
    });
  });

  describe('value format', () => {
    it('should keep the picked calendar day when serialized to JSON', () => {
      host.dateCtrl.setValue(new Date(2026, 8, 24));
      fixture.detectChanges();

      input().value = '24.09.2026';
      input().dispatchEvent(new Event('input'));

      const serialized = JSON.parse(JSON.stringify({ date: host.dateCtrl.value })).date;
      expect(serialized).toMatch(/^2026-09-24T00:00:00\.000[+-]\d{2}:\d{2}$/);
    });

    it('should accept an ISO string written from code and display it formatted', () => {
      host.dateCtrl.setValue('2026-09-24T00:00:00.000+02:00');
      fixture.detectChanges();

      expect(input().value).toBe('24.9.2026');
      expect(host.dateCtrl.errors).toBeNull();
    });

    it('should read the calendar day from an ISO string without shifting it', () => {
      // Midnight in +02:00 is the previous day in UTC; the day must not move.
      host.dateCtrl.setValue('2026-09-24T00:00:00.000+02:00');
      fixture.detectChanges();

      toggle().click();

      expect(mockService.open.mock.calls[0][0].selected!.getDate()).toBe(24);
      expect(mockService.open.mock.calls[0][0].selected!.getMonth()).toBe(8);
    });
  });

  describe('validation', () => {
    it('should report a format error for text that does not match the pattern', () => {
      input().value = '2025/12/2';
      input().dispatchEvent(new Event('input'));

      expect(host.dateCtrl.value).toBeNull();
      expect(host.dateCtrl.errors).toEqual({
        otpDatepickerFormat: { text: '2025/12/2', format: 'd.M.yyyy' },
      });
    });

    it('should accept both padded and plain input under the default format', () => {
      input().value = '01.01.2026';
      input().dispatchEvent(new Event('input'));
      expect(host.dateCtrl.errors).toBeNull();

      // Normalized once the field is left, not while typing.
      input().dispatchEvent(new Event('blur'));
      expect(input().value).toBe('1.1.2026');
    });

    it('should reject a separator that is not part of the format', () => {
      input().value = '1/1/1994';
      input().dispatchEvent(new Event('input'));

      expect(host.dateCtrl.value).toBeNull();
      expect(host.dateCtrl.hasError('otpDatepickerFormat')).toBe(true);
      expect(host.dateCtrl.hasError('otpDatepickerInvalidDate')).toBe(false);
    });

    it('should tell a day that cannot exist apart from a wrong format', () => {
      // The shape is right, April simply has 30 days.
      input().value = '31.4.2024';
      input().dispatchEvent(new Event('input'));

      expect(host.dateCtrl.value).toBeNull();
      expect(host.dateCtrl.hasError('otpDatepickerInvalidDate')).toBe(true);
      expect(host.dateCtrl.hasError('otpDatepickerFormat')).toBe(false);
    });

    it('should report an invalid-date error for a day that does not exist', () => {
      input().value = '30.02.2026';
      input().dispatchEvent(new Event('input'));

      expect(host.dateCtrl.value).toBeNull();
      expect(host.dateCtrl.errors).toEqual({
        otpDatepickerInvalidDate: { text: '30.02.2026' },
      });
    });

    it('should clear the parse error once the text is valid', () => {
      input().value = '99.99.2026';
      input().dispatchEvent(new Event('input'));
      expect(host.dateCtrl.hasError('otpDatepickerInvalidDate')).toBe(true);

      input().value = '15.01.2026';
      input().dispatchEvent(new Event('input'));
      expect(host.dateCtrl.errors).toBeNull();
    });

    it('should report a value before min', () => {
      host.min.set(new Date(2026, 0, 10));
      fixture.detectChanges();

      host.dateCtrl.setValue(new Date(2026, 0, 5));

      expect(host.dateCtrl.hasError('otpDatepickerMin')).toBe(true);
    });

    it('should report a value after max', () => {
      host.max.set(new Date(2026, 0, 20));
      fixture.detectChanges();

      host.dateCtrl.setValue(new Date(2026, 0, 25));

      expect(host.dateCtrl.hasError('otpDatepickerMax')).toBe(true);
    });

    it('should accept a value inside the range', () => {
      host.min.set(new Date(2026, 0, 10));
      host.max.set(new Date(2026, 0, 20));
      fixture.detectChanges();

      host.dateCtrl.setValue(new Date(2026, 0, 15));

      expect(host.dateCtrl.errors).toBeNull();
    });

    it('should re-validate when the bounds change', () => {
      host.dateCtrl.setValue(new Date(2026, 0, 5));
      expect(host.dateCtrl.errors).toBeNull();

      host.min.set(new Date(2026, 0, 10));
      fixture.detectChanges();

      expect(host.dateCtrl.hasError('otpDatepickerMin')).toBe(true);
    });

    it('should write a picked date into the control and the input text', () => {
      toggle().click();
      closedSubject.next(new Date(2026, 0, 20));
      fixture.detectChanges();

      expect(host.dateCtrl.value).toMatch(/^2026-01-20T00:00:00\.000[+-]\d{2}:\d{2}$/);
      expect(host.dateCtrl.touched).toBe(true);
      expect(input().value).toBe('20.1.2026');
      expect(host.selectedDate!.getDate()).toBe(20);
    });

    it('should not emit or write when dismissed without a date', () => {
      toggle().click();
      closedSubject.next(null);
      fixture.detectChanges();

      expect(host.selectedDate).toBeNull();
      expect(host.dateCtrl.value).toBeNull();
    });
  });

  describe('toggle', () => {
    it('should open the calendar on click', () => {
      toggle().click();
      fixture.detectChanges();

      expect(mockService.open).toHaveBeenCalledTimes(1);
    });

    it('should anchor the overlay to the trigger so the caret can point at it', () => {
      toggle().click();

      expect(mockService.open.mock.calls[0][0].origin).toBe(toggle());
      expect(mockService.open.mock.calls[0][0].anchor).toBe('trigger');
    });

    it('should anchor to the same trigger when opened with Alt+ArrowDown', () => {
      input().dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowDown', altKey: true, bubbles: true })
      );

      expect(mockService.open.mock.calls[0][0].origin).toBe(toggle());
      expect(mockService.open.mock.calls[0][0].anchor).toBe('trigger');
    });

    it('should pass the calendar configuration to the service', () => {
      host.min.set(new Date(2026, 0, 1));
      host.max.set(new Date(2026, 11, 31));
      host.dateCtrl.setValue(new Date(2026, 5, 15));
      fixture.detectChanges();

      toggle().click();

      const config = mockService.open.mock.calls[0][0];
      expect(config.min!.getFullYear()).toBe(2026);
      expect(config.max!.getMonth()).toBe(11);
      expect(config.selected!.getMonth()).toBe(5);
      expect(config.fixedWeeks).toBe(true);
    });

    it('should expose the open state through aria-expanded', () => {
      expect(toggle().getAttribute('aria-expanded')).toBe('false');

      toggle().click();
      fixture.detectChanges();
      expect(toggle().getAttribute('aria-expanded')).toBe('true');

      closedSubject.next(null);
      fixture.detectChanges();
      expect(toggle().getAttribute('aria-expanded')).toBe('false');
    });

    it('should mark a button toggle as type="button"', () => {
      expect(toggle().getAttribute('type')).toBe('button');
    });

    it('should not open twice while the calendar is open', () => {
      toggle().click();
      host.calendar().open();
      fixture.detectChanges();

      expect(mockService.open).toHaveBeenCalledTimes(1);
    });

    it('should not open when the control is disabled', () => {
      host.dateCtrl.disable();
      fixture.detectChanges();

      toggle().click();

      expect(mockService.open).not.toHaveBeenCalled();
    });
  });
});
