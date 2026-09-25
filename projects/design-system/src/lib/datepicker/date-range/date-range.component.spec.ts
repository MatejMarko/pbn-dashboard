import { Component, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { DateRangeComponent } from './date-range.component';
import { provideMockSvg } from '../../../test-utils/mock-svg';

@Component({
  template: `
    <otp-date-range [fromControl]="from" [toControl]="to" />
  `,
  imports: [ReactiveFormsModule, DateRangeComponent],
})
class Host {
  from = new FormControl<string | Date | null>(null, Validators.required);
  to = new FormControl<string | Date | null>(null, Validators.required);

  range = viewChild.required(DateRangeComponent);
}

describe('DateRangeComponent', () => {
  let fixture: ComponentFixture<Host>;
  let host: Host;

  function inputs(): HTMLInputElement[] {
    return Array.from(fixture.nativeElement.querySelectorAll('input'));
  }

  function messages(): string[] {
    return Array.from(
      fixture.nativeElement.querySelectorAll('.date-range__error') as NodeListOf<HTMLElement>
    ).map(element => element.textContent!.trim());
  }

  function invalidFields(): number {
    return fixture.nativeElement.querySelectorAll('otp-form-field.error-visible').length;
  }

  function type(index: number, text: string): void {
    const element = inputs()[index];
    element.value = text;
    element.dispatchEvent(new Event('input'));
    fixture.detectChanges();
  }

  function apply(): boolean {
    const valid = host.range().validate();
    fixture.detectChanges();
    return valid;
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Host],
      providers: [provideMockSvg()],
    }).compileComponents();

    fixture = TestBed.createComponent(Host);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should render two fields and no messages initially', () => {
    expect(inputs().length).toBe(2);
    expect(messages()).toEqual([]);
    expect(invalidFields()).toBe(0);
  });

  it('should stay silent while typing an invalid value', () => {
    type(0, '2025/12/2');

    expect(messages()).toEqual([]);
    expect(invalidFields()).toBe(0);
  });

  describe('on apply', () => {
    it('should report an empty field', () => {
      type(1, '1.1.2026');

      expect(apply()).toBe(false);
      expect(messages()).toEqual(['Please enter a date.']);
      expect(invalidFields()).toBe(1);
    });

    it('should report a wrong format', () => {
      type(0, '2025/12/2');
      type(1, '1.1.2026');

      apply();

      expect(messages()).toEqual(['Please enter date in the D.M.YYYY format.']);
    });

    it('should report a date that does not exist', () => {
      type(0, '30.2.2026');
      type(1, '1.1.2026');

      apply();

      expect(messages()).toEqual(['Please enter a valid date.']);
    });

    it('should show one message per field, stacked', () => {
      type(0, '30.2.2026');
      type(1, '2025/12/2');

      apply();

      expect(messages()).toEqual([
        'Please enter a valid date.',
        'Please enter date in the D.M.YYYY format.',
      ]);
      expect(invalidFields()).toBe(2);
    });

    it('should show only the highest-priority error for a field', () => {
      type(0, '30.2.2026');
      type(1, '1.1.2026');

      apply();

      expect(messages().length).toBe(1);
    });

    it('should mark both fields when from is after to', () => {
      type(0, '3.1.2026');
      type(1, '1.1.2026');

      expect(apply()).toBe(false);
      expect(messages()).toEqual(['From date must be before the To date.']);
      expect(invalidFields()).toBe(2);
    });

    it('should accept an equal from and to', () => {
      type(0, '1.1.2026');
      type(1, '1.1.2026');

      expect(apply()).toBe(true);
      expect(messages()).toEqual([]);
      expect(invalidFields()).toBe(0);
    });

    it('should accept a valid range', () => {
      type(0, '1.1.2026');
      type(1, '3.1.2026');

      expect(apply()).toBe(true);
      expect(messages()).toEqual([]);
    });
  });

  describe('clearing', () => {
    it('should clear messages on any value change without touching the values', () => {
      type(0, '3.1.2026');
      type(1, '1.1.2026');
      apply();
      expect(messages().length).toBe(1);

      type(1, '5.1.2026');

      expect(messages()).toEqual([]);
      expect(invalidFields()).toBe(0);
      // The values stay exactly as typed.
      expect(inputs()[0].value).toBe('3.1.2026');
      expect(inputs()[1].value).toBe('5.1.2026');
    });

    it('should clear the other field\'s message too', () => {
      type(0, '30.2.2026');
      type(1, '2025/12/2');
      apply();
      expect(messages().length).toBe(2);

      type(0, '1.1.2026');

      expect(messages()).toEqual([]);
    });

    it('should re-check on the next apply', () => {
      type(0, '3.1.2026');
      type(1, '1.1.2026');
      apply();

      type(1, '5.1.2026');
      expect(messages()).toEqual([]);

      expect(apply()).toBe(true);
      expect(messages()).toEqual([]);
    });
  });

  it('should point each input at its message for screen readers', () => {
    type(0, '30.2.2026');
    type(1, '2025/12/2');
    apply();

    const [from, to] = inputs();
    const ids = Array.from(
      fixture.nativeElement.querySelectorAll('.date-range__error') as NodeListOf<HTMLElement>
    ).map(element => element.id);

    expect(from.getAttribute('aria-describedby')).toBe(ids[0]);
    expect(to.getAttribute('aria-describedby')).toBe(ids[1]);
  });

  it('should point both inputs at the range message', () => {
    type(0, '3.1.2026');
    type(1, '1.1.2026');
    apply();

    const messageId = (fixture.nativeElement.querySelector('.date-range__error') as HTMLElement).id;
    const [from, to] = inputs();

    expect(from.getAttribute('aria-describedby')).toBe(messageId);
    expect(to.getAttribute('aria-describedby')).toBe(messageId);
  });
});
