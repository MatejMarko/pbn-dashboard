import { LOCALE_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { DatepickerIntl } from './datepicker-intl';
import { resolveDatepickerLocale } from './datepicker-translations';

function createIntl(localeId: string): DatepickerIntl {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    providers: [{ provide: LOCALE_ID, useValue: localeId }],
  });
  return TestBed.inject(DatepickerIntl);
}

describe('resolveDatepickerLocale', () => {
  it('should map Slovenian locale ids to sl', () => {
    expect(resolveDatepickerLocale('sl')).toBe('sl');
    expect(resolveDatepickerLocale('sl-SI')).toBe('sl');
    expect(resolveDatepickerLocale('SL-si')).toBe('sl');
  });

  it('should fall back to en for unsupported locales', () => {
    expect(resolveDatepickerLocale('en-US')).toBe('en');
    expect(resolveDatepickerLocale('de-AT')).toBe('en');
  });
});

describe('DatepickerIntl', () => {
  it('should use English labels by default', () => {
    const intl = createIntl('en-US');

    expect(intl.locale()).toBe('en');
    expect(intl.weekdaysShort()).toEqual(['M', 'Tu', 'W', 'Th', 'F', 'Sa', 'Su']);
    expect(intl.monthsLong()[0]).toBe('January');
    expect(intl.formatMonthYear(new Date(2026, 0, 1))).toBe('January 2026');
  });

  it('should use Slovenian labels when LOCALE_ID is Slovenian', () => {
    const intl = createIntl('sl-SI');

    expect(intl.locale()).toBe('sl');
    expect(intl.weekdaysShort()).toEqual(['Po', 'T', 'Sr', 'Č', 'Pe', 'So', 'N']);
    expect(intl.monthsLong()[7]).toBe('avgust');
    expect(intl.monthsShort()[7]).toBe('avg');
    expect(intl.formatMonthYear(new Date(2026, 0, 1))).toBe('januar 2026');
    expect(intl.calendarLabel()).toBe('Izberite datum');
  });

  it('should switch labels at runtime', () => {
    const intl = createIntl('en-US');

    intl.setLocale('sl');

    expect(intl.monthsLong()[0]).toBe('januar');
    expect(intl.weekdaysShort()[3]).toBe('Č');
  });

  it('should build a full date label with the weekday, Monday first', () => {
    const intl = createIntl('en-US');

    // 5 January 2026 is a Monday.
    expect(intl.formatFullDate(new Date(2026, 0, 5))).toBe('Monday, 5 January 2026');
    // 11 January 2026 is a Sunday.
    expect(intl.formatFullDate(new Date(2026, 0, 11))).toBe('Sunday, 11 January 2026');
  });

  it('should build a full date label in Slovenian style', () => {
    const intl = createIntl('sl');

    expect(intl.formatFullDate(new Date(2026, 0, 5))).toBe('ponedeljek, 5. januar 2026');
  });
});
