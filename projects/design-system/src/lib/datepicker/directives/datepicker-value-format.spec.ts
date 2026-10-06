import { Component, signal, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CalendarComponent } from '../calendar/calendar.component';
import { DatepickerInputDirective, DatepickerValueFormat } from './datepicker-input.directive';

@Component({
  template: `
    <input [otpDatepickerInput]="picker" [valueFormat]="valueFormat()" [formControl]="dateCtrl" />
    <otp-calendar #picker />
  `,
  imports: [ReactiveFormsModule, CalendarComponent, DatepickerInputDirective],
})
class Host {
  readonly valueFormat = signal<DatepickerValueFormat>('date');
  dateCtrl = new FormControl<string | Date | null>(null);
  datepickerInput = viewChild.required(DatepickerInputDirective);
}

describe('DatepickerInputDirective valueFormat', () => {
  let fixture: ComponentFixture<Host>;
  let host: Host;

  function input(): HTMLInputElement {
    return fixture.nativeElement.querySelector('input');
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [Host] }).compileComponents();

    fixture = TestBed.createComponent(Host);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should store a Date when valueFormat is "date"', () => {
    input().value = '24.09.2026';
    input().dispatchEvent(new Event('input'));

    expect(host.dateCtrl.value).toBeInstanceOf(Date);
    expect((host.dateCtrl.value as Date).getDate()).toBe(24);
    expect((host.dateCtrl.value as Date).getHours()).toBe(0);
  });

  it('should store an ISO string with the local offset when valueFormat is "iso"', () => {
    host.valueFormat.set('iso');
    fixture.detectChanges();

    input().value = '24.09.2026';
    input().dispatchEvent(new Event('input'));

    expect(host.dateCtrl.value).toMatch(/^2026-09-24T00:00:00\.000[+-]\d{2}:\d{2}$/);
  });

  it('should round-trip an ISO value back into the field', () => {
    host.valueFormat.set('iso');
    fixture.detectChanges();

    input().value = '24.09.2026';
    input().dispatchEvent(new Event('input'));

    const stored = host.dateCtrl.value as string;
    host.dateCtrl.reset();
    fixture.detectChanges();
    expect(input().value).toBe('');

    host.dateCtrl.setValue(stored);
    fixture.detectChanges();
    expect(input().value).toBe('24.9.2026');
  });
});
