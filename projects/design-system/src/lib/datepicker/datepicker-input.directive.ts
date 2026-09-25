import { Directive, effect, ElementRef, forwardRef, inject, input, OnDestroy, OnInit } from '@angular/core';
import {
  AbstractControl,
  ControlValueAccessor,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  ValidationErrors,
  Validator,
} from '@angular/forms';
import { CalendarComponent, DatepickerInputHost } from './calendar.component';
import {
  compareDates,
  DateParseStatus,
  formatDate,
  formatIsoWithOffset,
  parseDate,
  parseDateDetailed,
  parseIsoDate,
} from './date-utils';

/**
 * Shape of the value the form control holds.
 *
 * - `iso`: ISO 8601 with the local offset, `2026-09-24T00:00:00.000+02:00`.
 *   Survives JSON serialization without the calendar day shifting.
 * - `date`: a `Date` at local midnight.
 */
export type DatepickerValueFormat = 'iso' | 'date';

/**
 * Connects an input to an `<otp-calendar>`.
 *
 * It is the input's `ControlValueAccessor`, so it — and nothing else — owns the
 * text in the field: the control always holds a `Date` (or `null`), and the
 * field always shows it in `dateFormat`, whether the value came from the
 * calendar, from typing, or from `setValue`/`patchValue`/`reset`.
 *
 * It also validates, reporting `otpDatepickerParse`, `otpDatepickerMin` and
 * `otpDatepickerMax`.
 *
 * It does **not** open the calendar on click; that belongs to
 * `[otpDatepickerToggle]`.
 */
@Directive({
  selector: '[otpDatepickerInput]',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DatepickerInputDirective),
      multi: true,
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => DatepickerInputDirective),
      multi: true,
    },
  ],
  host: {
    '[attr.aria-haspopup]': '"dialog"',
    '[attr.aria-expanded]': 'calendar().isOpen()',
    '[attr.autocomplete]': 'isInput ? "off" : null',
    '(keydown)': 'onKeydown($event)',
    '(input)': 'onInput($event)',
    '(blur)': 'onBlur()',
  },
})
export class DatepickerInputDirective
  implements ControlValueAccessor, Validator, DatepickerInputHost, OnInit, OnDestroy {
  readonly calendar = input.required<CalendarComponent>({ alias: 'otpDatepickerInput' });
  /** How the date is shown in the field. */
  readonly dateFormat = input('dd.MM.yyyy');
  /** How the date is stored in the form control. */
  readonly valueFormat = input<DatepickerValueFormat>('iso');

  private readonly elementRef = inject(ElementRef<HTMLElement>);

  readonly isInput: boolean;

  /** The picked day, always kept internally as a local `Date`. */
  private value: Date | null = null;
  /** Text that could not be parsed, kept so the validator can report it. */
  private parseFailureText: string | null = null;
  /** Why that text could not be parsed. */
  private parseFailureStatus: Exclude<DateParseStatus, 'ok'> = 'format';
  private isDisabled = false;

  /** Resolved in `ngOnInit`; the validator may run before inputs are bound. */
  private calendarRef: CalendarComponent | null = null;

  private onChange: (value: string | Date | null) => void = () => {};
  private onTouched: () => void = () => {};
  private onValidatorChange: () => void = () => {};

  constructor() {
    const tag = this.elementRef.nativeElement.tagName.toLowerCase();
    this.isInput = tag === 'input' || tag === 'textarea';

    // Re-run validation when the calendar's bounds change.
    effect(() => {
      const calendar = this.calendar();
      calendar.min();
      calendar.max();
      this.onValidatorChange();
    });
  }

  ngOnInit(): void {
    this.calendarRef = this.calendar();
    this.calendarRef.registerInput(this);
  }

  ngOnDestroy(): void {
    this.calendarRef?.unregisterInput(this);
  }

  // --- DatepickerInputHost -------------------------------------------------

  get element(): HTMLElement {
    return this.elementRef.nativeElement;
  }

  /**
   * A readonly field is a deliberate "pick from the calendar only" pattern, so
   * only a disabled field blocks opening.
   */
  get disabled(): boolean {
    return this.isDisabled || (this.elementRef.nativeElement as HTMLInputElement).disabled === true;
  }

  readDate(): Date | null {
    return this.value;
  }

  writeDate(date: Date): void {
    this.value = date;
    this.parseFailureText = null;
    this.setText(formatDate(date, this.dateFormat()));

    this.emitValue();
    this.onTouched();
    this.onValidatorChange();
  }

  // --- ControlValueAccessor ------------------------------------------------

  writeValue(value: unknown): void {
    const date = this.coerceDate(value);
    this.value = date;

    if (date) {
      this.parseFailureText = null;
      this.setText(formatDate(date, this.dateFormat()));
    } else if (typeof value === 'string' && value !== '') {
      // Keep unparseable text visible so the user can correct it.
      this.parseFailureText = value;
      this.setText(value);
    } else {
      this.parseFailureText = null;
      this.setText('');
    }
  }

  registerOnChange(fn: (value: string | Date | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
    if (this.isInput) {
      (this.elementRef.nativeElement as HTMLInputElement).disabled = isDisabled;
    }
  }

  // --- Validator -----------------------------------------------------------

  validate(control: AbstractControl): ValidationErrors | null {
    if (this.parseFailureText !== null) {
      return this.parseFailureStatus === 'invalid'
        ? { otpDatepickerInvalidDate: { text: this.parseFailureText } }
        : { otpDatepickerFormat: { text: this.parseFailureText, format: this.dateFormat() } };
    }

    const value = this.coerceDate(control.value);
    if (!value) return null;

    const min = this.calendarRef?.min() ?? null;
    if (min && compareDates(value, min) < 0) {
      return { otpDatepickerMin: { min, actual: value } };
    }

    const max = this.calendarRef?.max() ?? null;
    if (max && compareDates(value, max) > 0) {
      return { otpDatepickerMax: { max, actual: value } };
    }

    return null;
  }

  registerOnValidatorChange(fn: () => void): void {
    this.onValidatorChange = fn;
  }

  // --- Host listeners ------------------------------------------------------

  /** Alt+ArrowDown is the keyboard equivalent of clicking the toggle. */
  onKeydown(event: KeyboardEvent): void {
    if (event.altKey && event.key === 'ArrowDown') {
      event.preventDefault();
      this.calendar().open();
    }
  }

  /** Parses as the user types, without ever rewriting what they typed. */
  onInput(event: Event): void {
    const text = (event.target as HTMLInputElement).value;

    if (text.trim() === '') {
      this.parseFailureText = null;
      this.value = null;
    } else {
      const result = parseDateDetailed(text, this.dateFormat());
      this.parseFailureText = result.status === 'ok' ? null : text;
      this.parseFailureStatus = result.status === 'ok' ? 'format' : result.status;
      this.value = result.date;
    }

    this.emitValue();
    this.onValidatorChange();
  }

  onBlur(): void {
    // Normalizes the text once the user is done, e.g. after a paste.
    if (this.value) {
      this.setText(formatDate(this.value, this.dateFormat()));
    }
    this.onTouched();
  }

  // --- Internals -----------------------------------------------------------

  /** Pushes the current value to the form control in the configured shape. */
  private emitValue(): void {
    if (!this.value) {
      this.onChange(null);
      return;
    }
    this.onChange(
      this.valueFormat() === 'iso' ? formatIsoWithOffset(this.value) : this.value
    );
  }

  private coerceDate(value: unknown): Date | null {
    if (value instanceof Date) {
      return isNaN(value.getTime()) ? null : value;
    }
    if (typeof value === 'string' && value !== '') {
      // An ISO string may come from the control; the display format from typing.
      return parseIsoDate(value) ?? parseDate(value, this.dateFormat());
    }
    return null;
  }

  private setText(text: string): void {
    if (this.isInput) {
      (this.elementRef.nativeElement as HTMLInputElement).value = text;
    }
  }
}
