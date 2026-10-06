import { computed, inject, Injectable, LOCALE_ID, signal } from '@angular/core';
import {
  DATEPICKER_TRANSLATIONS,
  DatepickerLocale,
  resolveDatepickerLocale,
} from './datepicker-translations';

/**
 * Labels and month/weekday names for the datepicker.
 *
 * The locale is seeded from Angular's `LOCALE_ID` and can be changed at
 * runtime with `setLocale()`. Apps needing different wording can provide a
 * subclass of this service.
 */
@Injectable({ providedIn: 'root' })
export class DatepickerIntl {
  private readonly localeId = inject(LOCALE_ID);

  readonly locale = signal<DatepickerLocale>(resolveDatepickerLocale(this.localeId));

  private readonly translation = computed(() => DATEPICKER_TRANSLATIONS[this.locale()]);

  readonly weekdaysShort = computed(() => this.translation().weekdaysShort);
  readonly weekdaysLong = computed(() => this.translation().weekdaysLong);
  readonly monthsLong = computed(() => this.translation().monthsLong);
  readonly monthsShort = computed(() => this.translation().monthsShort);

  readonly calendarLabel = computed(() => this.translation().calendarLabel);
  readonly switchToDayViewLabel = computed(() => this.translation().switchToDayViewLabel);
  readonly switchToMonthViewLabel = computed(() => this.translation().switchToMonthViewLabel);
  readonly switchToYearViewLabel = computed(() => this.translation().switchToYearViewLabel);

  setLocale(locale: DatepickerLocale): void {
    this.locale.set(locale);
  }

  /** `January 2026` / `januar 2026`. */
  formatMonthYear(date: Date): string {
    return `${this.monthsLong()[date.getMonth()]} ${date.getFullYear()}`;
  }

  /** Full date for screen readers, e.g. `Monday, 5 January 2026` / `ponedeljek, 5. januar 2026`. */
  formatFullDate(date: Date): string {
    const t = this.translation();
    const weekday = t.weekdaysLong[(date.getDay() + 6) % 7];
    const day = `${date.getDate()}${t.dayNumberSuffix}`;
    return `${weekday}, ${day} ${t.monthsLong[date.getMonth()]} ${date.getFullYear()}`;
  }
}
