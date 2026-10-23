import { InjectionToken, Provider } from '@angular/core';

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
 * Defaults to `null`, which leaves the built-in handling in place: a `Date` or
 * an ISO string is read, and `valueFormat` decides what is written back.
 * Providing an adapter overrides both directions, and `valueFormat` no longer
 * applies.
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
