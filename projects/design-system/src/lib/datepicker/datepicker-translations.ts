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
  prevMonthLabel: string;
  nextMonthLabel: string;
  prevYearLabel: string;
  nextYearLabel: string;
  prevYearRangeLabel: string;
  nextYearRangeLabel: string;
  switchToDayViewLabel: string;
  switchToMonthViewLabel: string;
  switchToYearViewLabel: string;

  /** Field is empty. */
  requiredError: string;
  /** Text does not match the expected pattern; `{format}` is replaced. */
  formatError: string;
  /** Pattern matches but the day does not exist. */
  invalidDateError: string;
  /** "From" is after "To" in a date range. */
  rangeOrderError: string;
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
  prevMonthLabel: 'Previous month',
  nextMonthLabel: 'Next month',
  prevYearLabel: 'Previous year',
  nextYearLabel: 'Next year',
  prevYearRangeLabel: 'Previous 12 years',
  nextYearRangeLabel: 'Next 12 years',
  switchToDayViewLabel: 'Switch to day view',
  switchToMonthViewLabel: 'Switch to month view',
  switchToYearViewLabel: 'Switch to year view',
  requiredError: 'Please enter a date.',
  formatError: 'Please enter date in the {format} format.',
  invalidDateError: 'Please enter a valid date.',
  rangeOrderError: 'From date must be before the To date.',
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
  prevMonthLabel: 'Prejšnji mesec',
  nextMonthLabel: 'Naslednji mesec',
  prevYearLabel: 'Prejšnje leto',
  nextYearLabel: 'Naslednje leto',
  prevYearRangeLabel: 'Prejšnjih 12 let',
  nextYearRangeLabel: 'Naslednjih 12 let',
  switchToDayViewLabel: 'Preklopi na izbiro dneva',
  switchToMonthViewLabel: 'Preklopi na izbiro meseca',
  switchToYearViewLabel: 'Preklopi na izbiro leta',
  requiredError: 'Vnesite datum.',
  formatError: 'Vnesite datum v obliki {format}.',
  invalidDateError: 'Vnesite veljaven datum.',
  rangeOrderError: 'Datum Od mora biti pred datumom Do.',
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
