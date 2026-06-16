import { Component, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CalendarComponent } from './calendar.component';
import { DatepickerTriggerDirective } from './datepicker-trigger.directive';
import { DatepickerService } from './datepicker.service';
import { DatepickerRef } from './datepicker-ref';
import { Subject } from 'rxjs';

@Component({
  template: `
    <input [otpDatepickerTrigger]="picker" [formControl]="dateCtrl" />
    <otp-calendar #picker
                  [min]="min"
                  [max]="max"
                  (dateSelected)="onDateSelected($event)" />
  `,
  imports: [ReactiveFormsModule, DatepickerTriggerDirective, CalendarComponent],
})
class InputTriggerHost {
  dateCtrl = new FormControl<Date | null>(null);
  min: Date | null = null;
  max: Date | null = null;
  selectedDate: Date | null = null;

  trigger = viewChild.required(DatepickerTriggerDirective);

  onDateSelected(date: Date): void {
    this.selectedDate = date;
  }
}

@Component({
  template: `
    <button [otpDatepickerTrigger]="picker">Pick date</button>
    <otp-calendar #picker
                  (dateSelected)="onDateSelected($event)" />
  `,
  imports: [DatepickerTriggerDirective, CalendarComponent],
})
class ButtonTriggerHost {
  selectedDate: Date | null = null;

  onDateSelected(date: Date): void {
    this.selectedDate = date;
  }
}

describe('DatepickerTriggerDirective', () => {
  let mockService: { open: ReturnType<typeof vi.fn> };
  let closedSubject: Subject<Date | null>;

  beforeEach(() => {
    closedSubject = new Subject<Date | null>();
    const mockRef: Partial<DatepickerRef> = {
      afterClosed: () => closedSubject.asObservable(),
      close: vi.fn(),
    };
    mockService = {
      open: vi.fn().mockReturnValue(mockRef),
    };
  });

  describe('on input element', () => {
    let fixture: ComponentFixture<InputTriggerHost>;
    let host: InputTriggerHost;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [InputTriggerHost],
        providers: [
          { provide: DatepickerService, useValue: mockService },
        ],
      }).compileComponents();

      fixture = TestBed.createComponent(InputTriggerHost);
      host = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should set aria-haspopup="dialog"', () => {
      const input = fixture.nativeElement.querySelector('input');
      expect(input.getAttribute('aria-haspopup')).toBe('dialog');
    });

    it('should set aria-expanded to false initially', () => {
      const input = fixture.nativeElement.querySelector('input');
      expect(input.getAttribute('aria-expanded')).toBe('false');
    });

    it('should set autocomplete="off" on input', () => {
      const input = fixture.nativeElement.querySelector('input');
      expect(input.getAttribute('autocomplete')).toBe('off');
    });

    it('should open datepicker on click', () => {
      const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
      input.click();
      fixture.detectChanges();

      expect(mockService.open).toHaveBeenCalled();
      expect(input.getAttribute('aria-expanded')).toBe('true');
    });

    it('should open datepicker on Alt+ArrowDown', () => {
      const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
      input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', altKey: true, bubbles: true }));
      fixture.detectChanges();

      expect(mockService.open).toHaveBeenCalled();
    });

    it('should pass calendar config to service', () => {
      host.min = new Date(2026, 0, 1);
      host.max = new Date(2026, 11, 31);
      fixture.detectChanges();

      const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
      input.click();

      const config = mockService.open.mock.calls[0][0];
      expect(config.min).toEqual(host.min);
      expect(config.max).toEqual(host.max);
    });

    it('should emit dateSelected on calendar when date is chosen', () => {
      const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
      input.click();
      fixture.detectChanges();

      const date = new Date(2026, 0, 20);
      closedSubject.next(date);
      closedSubject.complete();
      fixture.detectChanges();

      expect(host.selectedDate?.getDate()).toBe(20);
    });

    it('should update form control when date is chosen', () => {
      const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
      input.click();
      fixture.detectChanges();

      const date = new Date(2026, 0, 20);
      closedSubject.next(date);
      closedSubject.complete();
      fixture.detectChanges();

      expect(host.dateCtrl.value).toEqual(date);
    });

    it('should update input text when date is chosen', () => {
      const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
      input.click();
      fixture.detectChanges();

      const date = new Date(2026, 0, 20);
      closedSubject.next(date);
      closedSubject.complete();
      fixture.detectChanges();

      expect(input.value).toBe('20.01.2026');
    });

    it('should not emit dateSelected when dismissed without selecting', () => {
      const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
      input.click();
      fixture.detectChanges();

      closedSubject.next(null);
      closedSubject.complete();
      fixture.detectChanges();

      expect(host.selectedDate).toBeNull();
    });

    it('should set aria-expanded back to false after close', () => {
      const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
      input.click();
      fixture.detectChanges();

      closedSubject.next(null);
      closedSubject.complete();
      fixture.detectChanges();

      expect(input.getAttribute('aria-expanded')).toBe('false');
    });
  });

  describe('on button element', () => {
    let fixture: ComponentFixture<ButtonTriggerHost>;
    let host: ButtonTriggerHost;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [ButtonTriggerHost],
        providers: [
          { provide: DatepickerService, useValue: mockService },
        ],
      }).compileComponents();

      fixture = TestBed.createComponent(ButtonTriggerHost);
      host = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should set aria-haspopup="dialog" on button', () => {
      const button = fixture.nativeElement.querySelector('button');
      expect(button.getAttribute('aria-haspopup')).toBe('dialog');
    });

    it('should not set autocomplete on button', () => {
      const button = fixture.nativeElement.querySelector('button');
      expect(button.getAttribute('autocomplete')).toBeNull();
    });

    it('should emit dateSelected through calendar on selection', () => {
      const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');
      button.click();
      fixture.detectChanges();

      const date = new Date(2026, 5, 15);
      closedSubject.next(date);
      closedSubject.complete();
      fixture.detectChanges();

      expect(host.selectedDate?.getDate()).toBe(15);
    });
  });
});
