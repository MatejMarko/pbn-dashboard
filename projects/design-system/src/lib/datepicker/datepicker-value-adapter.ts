import { InjectionToken, Provider } from '@angular/core';
import { formatIsoWithOffset, parseIsoDate } from './date-utils';

/**
 * Translates between the date type an application keeps in its form controls
 * and the native `Date` the datepicker works with internally.
 *
 * The library never depends on a date library: an app using Luxon, Temporal or
 * anything else provides the two conversions and keeps its own type end to end.
 *
 * Both directions are expected to describe the same calendar day. Reading
 * fields (`year`, `month`, `day`) is safer than converting instants — a value
 * in another time zone can otherwise land on the neighbouring day.
 */
export interface DatepickerValueAdapter<T = unknown> {
  /** Model value -> the day the calendar should show, or `null` if unreadable. */
  toDate(value: T | null): Date | null;
  /** A picked day -> the value written back to the form control. */
  fromDate(date: Date | null): T | null;
}

/**
 * Defaults to `null`, which keeps native `Date` as the form control's type.
 * A `Date`, an ISO string or text in the field's own format is still read, but
 * a picked day is written back as a `Date`.
 */
export const OTP_DATEPICKER_VALUE_ADAPTER = new InjectionToken<DatepickerValueAdapter | null>(
  'OTP_DATEPICKER_VALUE_ADAPTER',
  {
    providedIn: 'root',
    factory: () => null,
  },
);

/** Registers the date type used by every datepicker in the application. */
export function provideDatepickerValueAdapter<T>(
  adapter: DatepickerValueAdapter<T>,
): Provider {
  return { provide: OTP_DATEPICKER_VALUE_ADAPTER, useValue: adapter };
}
