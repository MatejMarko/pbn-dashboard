import { Component, signal, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CalendarComponent } from '../calendar/calendar.component';
import { DatepickerInputDirective } from './datepicker-input.directive';
import {
  DatepickerValueAdapter,
  provideDatepickerValueAdapter,
} from '../datepicker-value-adapter';

/**
 * Stands in for Luxon's DateTime: an immutable object exposing `year`, `month`
 * (1-based) and `day`, whose `toString()` looks like an ISO timestamp. Luxon
 * itself is not a dependency of this library.
 */
class FakeDateTime {
  readonly isValid = true;

  constructor(
    readonly year: number,
    readonly month: number,
    readonly day: number,
  ) {}

  toString(): string {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${this.year}-${pad(this.month)}-${pad(this.day)}T00:00:00.000+02:00`;
  }
}

const fakeDateTimeAdapter: DatepickerValueAdapter<FakeDateTime> = {
  toDate: value =>
    value instanceof FakeDateTime && value.isValid
      ? new Date(value.year, value.month - 1, value.day)
      : null,
  fromDate: date =>
    date ? new FakeDateTime(date.getFullYear(), date.getMonth() + 1, date.getDate()) : null,
};

@Component({
  template: `
    <input [otpDatepickerInput]="picker" [formControl]="ctrl" />
    <otp-calendar #picker [min]="min()" [max]="max()" />
  `,
  imports: [ReactiveFormsModule, CalendarComponent, DatepickerInputDirective],
})
class Host {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ctrl = new FormControl<any>(null);
  readonly min = signal<unknown>(null);
  readonly max = signal<unknown>(null);
  calendar = viewChild.required(CalendarComponent);
}

describe('datepicker value adapter', () => {
  let fixture: ComponentFixture<Host>;
  let host: Host;

  function input(): HTMLInputElement {
    return fixture.nativeElement.querySelector('input');
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Host],
      providers: [provideDatepickerValueAdapter(fakeDateTimeAdapter)],
    }).compileComponents();

    fixture = TestBed.createComponent(Host);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should fill the field from the application\'s own date type', () => {
    host.ctrl.setValue(new FakeDateTime(2026, 10, 6));
    fixture.detectChanges();

    expect(input().value).toBe('6.10.2026');
  });

  it('should write the same type back when the user types', () => {
    input().value = '6.10.2026';
    input().dispatchEvent(new Event('input'));

    expect(host.ctrl.value).toBeInstanceOf(FakeDateTime);
    expect(host.ctrl.value.year).toBe(2026);
    expect(host.ctrl.value.month).toBe(10);
    expect(host.ctrl.value.day).toBe(6);
  });

  it('should round-trip without changing the day', () => {
    const original = new FakeDateTime(2026, 1, 1);
    host.ctrl.setValue(original);
    fixture.detectChanges();

    input().dispatchEvent(new Event('blur'));
    input().value = '1.1.2026';
    input().dispatchEvent(new Event('input'));

    expect(host.ctrl.value.year).toBe(original.year);
    expect(host.ctrl.value.month).toBe(original.month);
    expect(host.ctrl.value.day).toBe(original.day);
  });

  it('should read min and max through the adapter', () => {
    host.min.set(new FakeDateTime(2026, 10, 1));
    host.max.set(new FakeDateTime(2026, 10, 31));
    fixture.detectChanges();

    expect(host.calendar().minDate()?.getDate()).toBe(1);
    expect(host.calendar().maxDate()?.getMonth()).toBe(9);
  });

  it('should validate bounds given in the application\'s type', () => {
    host.min.set(new FakeDateTime(2026, 10, 10));
    fixture.detectChanges();

    host.ctrl.setValue(new FakeDateTime(2026, 10, 5));

    expect(host.ctrl.hasError('otpDatepickerMin')).toBe(true);
  });

  it('should still accept text typed in the display format', () => {
    input().value = '31.12.2026';
    input().dispatchEvent(new Event('input'));

    expect(host.ctrl.value).toBeInstanceOf(FakeDateTime);
    expect(host.ctrl.value.day).toBe(31);
  });

  it('should warn instead of silently clearing an unreadable value', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    host.ctrl.setValue({ not: 'a date' });
    fixture.detectChanges();

    expect(input().value).toBe('');
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('cannot read a value of type'));
    warn.mockRestore();
  });
});
