import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  input,
  OnInit,
  signal,
  ViewEncapsulation,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AbstractControl, FormControl, ReactiveFormsModule } from '@angular/forms';
import { merge } from 'rxjs';
import { CalendarComponent } from '../calendar.component';
import { compareDates } from '../date-utils';
import { DatepickerInputDirective } from '../datepicker-input.directive';
import { DatepickerIntl } from '../datepicker-intl';
import { DatepickerToggleDirective } from '../datepicker-toggle.directive';
import { FormFieldComponent } from '../../form-field/form-field.component';
import { LabelDirective } from '../../form-field/directives/label.directive';
import { InputComponent } from '../../input/input.component';
import { DsIconButton } from '../../ds-button/ds-icon-button/ds-icon-button';
import { SvgComponent } from '../../svg/svg';
import { SvgNames } from '../../svg/svg-names.enum';
import { ErrorStateMatcher, OTP_ERROR_STATE_MATCHER } from '../../form-field/error-state-matcher';

/** A message shown under the pair of fields. */
interface RangeMessage {
  id: string;
  text: string;
  /** Which field(s) the message belongs to, for `aria-describedby`. */
  fields: ('from' | 'to')[];
}

let nextUniqueId = 0;

/**
 * A "from / to" date pair that validates on demand.
 *
 * Errors are computed continuously but only *shown* once {@link validate} is
 * called (from an Apply button); changing either value hides them again
 * without touching the values themselves, and the next `validate()` re-checks.
 *
 * Messages render under both fields, one per field at most, plus the range
 * rule — never inside `<otp-form-field>`.
 */
@Component({
  selector: 'otp-date-range',
  templateUrl: './date-range.component.html',
  styleUrl: './date-range.component.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    FormFieldComponent,
    LabelDirective,
    InputComponent,
    DsIconButton,
    SvgComponent,
    CalendarComponent,
    DatepickerInputDirective,
    DatepickerToggleDirective,
  ],
  providers: [
    { provide: OTP_ERROR_STATE_MATCHER, useExisting: DateRangeComponent },
  ],
})
export class DateRangeComponent implements ErrorStateMatcher, OnInit {
  readonly fromControl = input.required<FormControl<string | Date | null>>();
  readonly toControl = input.required<FormControl<string | Date | null>>();

  readonly fromLabel = input('From');
  readonly toLabel = input('To');

  /** Pattern used in the fields, e.g. `1.1.2026`. */
  readonly dateFormat = input('d.M.yyyy');
  /** How that pattern is spelled out in the format error message. */
  readonly formatLabel = input('D.M.YYYY');

  readonly min = input<Date | null>(null);
  readonly max = input<Date | null>(null);

  readonly intl = inject(DatepickerIntl);
  private readonly destroyRef = inject(DestroyRef);

  readonly SvgNames = SvgNames;

  private readonly id = nextUniqueId++;

  /** The display latch: off until `validate()`, off again on any edit. */
  private readonly showErrors = signal(false);

  readonly messages = computed<RangeMessage[]>(() => {
    if (!this.showErrors()) return [];

    const messages: RangeMessage[] = [];

    const fromMessage = this.fieldMessage(this.fromControl());
    if (fromMessage) {
      messages.push({ id: `otp-date-range-${this.id}-from-error`, text: fromMessage, fields: ['from'] });
    }

    const toMessage = this.fieldMessage(this.toControl());
    if (toMessage) {
      messages.push({ id: `otp-date-range-${this.id}-to-error`, text: toMessage, fields: ['to'] });
    }

    if (this.hasRangeError()) {
      messages.push({
        id: `otp-date-range-${this.id}-order-error`,
        text: this.intl.rangeOrderError(),
        fields: ['from', 'to'],
      });
    }

    return messages;
  });

  readonly fromDescribedBy = computed(() => this.describedBy('from'));
  readonly toDescribedBy = computed(() => this.describedBy('to'));

  ngOnInit(): void {
    // Any edit clears the messages; the values themselves are untouched.
    merge(this.fromControl().valueChanges, this.toControl().valueChanges)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.showErrors.set(false));
  }

  /**
   * Runs the checks and shows the messages. Returns whether the range is
   * usable, so an Apply handler can decide whether to continue.
   */
  validate(): boolean {
    this.showErrors.set(true);
    return !this.hasErrors();
  }

  /** Hides the messages without changing any value. */
  clearErrors(): void {
    this.showErrors.set(false);
  }

  hasErrors(): boolean {
    return (
      this.fieldMessage(this.fromControl()) !== null
      || this.fieldMessage(this.toControl()) !== null
      || this.hasRangeError()
    );
  }

  // --- ErrorStateMatcher ---------------------------------------------------

  /** Both fields turn red for the range error; otherwise only the one at fault. */
  isErrorState(control: AbstractControl | null): boolean {
    if (!control || !this.showErrors()) return false;

    if (this.hasRangeError() && (control === this.fromControl() || control === this.toControl())) {
      return true;
    }
    return this.fieldMessage(control as FormControl<string | Date | null>) !== null;
  }

  // --- Internals -----------------------------------------------------------

  /** The single highest-priority message for a field, or `null`. */
  private fieldMessage(control: FormControl<string | Date | null>): string | null {
    const errors = control.errors;
    if (!errors) return null;

    // Unparseable text also leaves the value null, so `required` would fire
    // alongside it. What the user typed is the more useful message.
    if (errors['otpDatepickerFormat']) return this.intl.formatError(this.formatLabel());
    if (errors['otpDatepickerInvalidDate']) return this.intl.invalidDateError();
    if (errors['required']) return this.intl.requiredError();
    if (errors['otpDatepickerMin'] || errors['otpDatepickerMax']) return this.intl.invalidDateError();

    return null;
  }

  /** `from` after `to`; equal dates are a valid single-day range. */
  private hasRangeError(): boolean {
    const from = this.asDate(this.fromControl().value);
    const to = this.asDate(this.toControl().value);
    if (!from || !to) return false;

    return compareDates(from, to) > 0;
  }

  private asDate(value: string | Date | null): Date | null {
    if (value instanceof Date) return value;
    if (typeof value === 'string' && value !== '') {
      const parsed = new Date(value);
      return isNaN(parsed.getTime()) ? null : parsed;
    }
    return null;
  }

  private describedBy(field: 'from' | 'to'): string | null {
    const ids = this.messages()
      .filter(message => message.fields.includes(field))
      .map(message => message.id);

    return ids.length ? ids.join(' ') : null;
  }
}
