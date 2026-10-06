/** Locales the datepicker ships translations for. */
export type DatepickerLocale = 'en' | 'sl';

export interface DatepickerTranslation {
  /** Short weekday headers, Monday first. */
  weekdaysShort: readonly string[];
  /** Full weekday names, Monday first. Used for screen readers. */
  weekdaysLong: readonly string[];
  /** Full month names, January first. */
  monthsLong: readonly string[];
  /** Short month names, January first. Used in the month grid. */
  monthsShort: readonly string[];
  /** Suffix after the day number in a full date (`5 January` vs `5. januar`). */
  dayNumberSuffix: string;

  calendarLabel: string;
  switchToDayViewLabel: string;
  switchToMonthViewLabel: string;
  switchToYearViewLabel: string;
}

const EN: DatepickerTranslation = {
  weekdaysShort: ['M', 'Tu', 'W', 'Th', 'F', 'Sa', 'Su'],
  weekdaysLong: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
  monthsLong: [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ],
  monthsShort: [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ],
  dayNumberSuffix: '',
  calendarLabel: 'Choose date',
  switchToDayViewLabel: 'Switch to day view',
  switchToMonthViewLabel: 'Switch to month view',
  switchToYearViewLabel: 'Switch to year view',
};

const SL: DatepickerTranslation = {
  weekdaysShort: ['Po', 'T', 'Sr', 'Č', 'Pe', 'So', 'N'],
  weekdaysLong: ['ponedeljek', 'torek', 'sreda', 'četrtek', 'petek', 'sobota', 'nedelja'],
  monthsLong: [
    'januar', 'februar', 'marec', 'april', 'maj', 'junij',
    'julij', 'avgust', 'september', 'oktober', 'november', 'december',
  ],
  monthsShort: [
    'jan', 'feb', 'mar', 'apr', 'maj', 'jun',
    'jul', 'avg', 'sep', 'okt', 'nov', 'dec',
  ],
  dayNumberSuffix: '.',
  calendarLabel: 'Izberite datum',
  switchToDayViewLabel: 'Preklopi na izbiro dneva',
  switchToMonthViewLabel: 'Preklopi na izbiro meseca',
  switchToYearViewLabel: 'Preklopi na izbiro leta',
};

export const DATEPICKER_TRANSLATIONS: Record<DatepickerLocale, DatepickerTranslation> = {
  en: EN,
  sl: SL,
};

/**
 * Maps an Angular `LOCALE_ID` (`sl`, `sl-SI`, `en-US`, ...) to a supported
 * datepicker locale. Unknown locales fall back to English.
 */
export function resolveDatepickerLocale(localeId: string): DatepickerLocale {
  const language = localeId.toLowerCase().split('-')[0];
  return language === 'sl' ? 'sl' : 'en';
}
