export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

/**
 * Returns a 6x7 grid of Date objects for the given month,
 * including leading/trailing days from adjacent months.
 * Week starts on Monday (firstDayOfWeek = 1).
 */
export function getMonthGrid(year: number, month: number, firstDayOfWeek = 1): Date[][] {
  const firstDay = new Date(year, month, 1);
  let startOffset = firstDay.getDay() - firstDayOfWeek;
  if (startOffset < 0) startOffset += 7;

  const gridStart = new Date(year, month, 1 - startOffset);
  const grid: Date[][] = [];

  for (let week = 0; week < 6; week++) {
    const row: Date[] = [];
    for (let day = 0; day < 7; day++) {
      const date = new Date(gridStart);
      date.setDate(gridStart.getDate() + week * 7 + day);
      row.push(date);
    }
    grid.push(row);
  }

  return grid;
}

/**
 * First day of the date's month. The panel browses by month, so it keeps its
 * cursor here: no day component means no overflow (31 + "April" would roll into
 * May) and no leap-year special case.
 */
export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear()
    && a.getMonth() === b.getMonth()
    && a.getDate() === b.getDate();
}

export function isSameMonth(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

export function compareDates(a: Date, b: Date): number {
  const aDay = new Date(a.getFullYear(), a.getMonth(), a.getDate()).getTime();
  const bDay = new Date(b.getFullYear(), b.getMonth(), b.getDate()).getTime();
  return aDay - bDay;
}

export function isDateInRange(date: Date, min: Date | null, max: Date | null): boolean {
  if (min && compareDates(date, min) < 0) return false;
  if (max && compareDates(date, max) > 0) return false;
  return true;
}

export function addMonths(date: Date, amount: number): Date {
  const result = new Date(date);
  const targetMonth = result.getMonth() + amount;
  result.setMonth(targetMonth);
  // Handle overflow (e.g., Jan 31 + 1 month = Feb 28, not Mar 3)
  if (result.getMonth() !== ((targetMonth % 12) + 12) % 12) {
    result.setDate(0); // Go to last day of previous month
  }
  return result;
}

export function addYears(date: Date, amount: number): Date {
  return addMonths(date, amount * 12);
}

/**
 * Supported pattern tokens: `yyyy`, `MM`/`M` (padded / plain month),
 * `dd`/`d` (padded / plain day). Anything else is a literal.
 */
const FORMAT_TOKENS = /yyyy|MM|M|dd|d/g;

export function formatDate(date: Date, format: string): string {
  return format.replace(FORMAT_TOKENS, token => {
    switch (token) {
      case 'yyyy':
        return date.getFullYear().toString();
      case 'MM':
        return (date.getMonth() + 1).toString().padStart(2, '0');
      case 'M':
        return (date.getMonth() + 1).toString();
      case 'dd':
        return date.getDate().toString().padStart(2, '0');
      case 'd':
        return date.getDate().toString();
      default:
        return token;
    }
  });
}

/**
 * Why a date could not be read:
 * - `format`: the text does not match the pattern at all (`2025/12/2`)
 * - `invalid`: the pattern matches but the day does not exist (`30.2.2026`)
 */
export type DateParseStatus = 'ok' | 'format' | 'invalid';

export interface DateParseResult {
  status: DateParseStatus;
  date: Date | null;
}

/**
 * Parses `value` and says *why* it failed, so a form can tell "wrong format"
 * apart from "that day does not exist".
 *
 * Padded tokens (`dd`, `MM`) require two digits; plain ones (`d`, `M`) accept
 * one or two, so `d.M.yyyy` reads both `1.1.2026` and `01.01.2026`.
 */
export function parseDateDetailed(value: string, format: string): DateParseResult {
  const { pattern, order } = buildPattern(format);
  const match = pattern.exec(value.trim());

  if (!match) return { status: 'format', date: null };

  let day = NaN;
  let month = NaN;
  let year = NaN;

  order.forEach((part, index) => {
    const parsed = parseInt(match[index + 1], 10);
    if (part === 'd') day = parsed;
    else if (part === 'M') month = parsed;
    else year = parsed;
  });

  if (isNaN(day) || isNaN(month) || isNaN(year)) return { status: 'format', date: null };
  if (month < 1 || month > 12) return { status: 'invalid', date: null };
  if (day < 1 || day > getDaysInMonth(year, month - 1)) return { status: 'invalid', date: null };

  return { status: 'ok', date: new Date(year, month - 1, day) };
}

function buildPattern(format: string): { pattern: RegExp; order: ('d' | 'M' | 'y')[] } {
  const order: ('d' | 'M' | 'y')[] = [];
  let source = '';
  let index = 0;

  while (index < format.length) {
    const rest = format.slice(index);

    if (rest.startsWith('yyyy')) {
      source += '(\\d{4})';
      order.push('y');
      index += 4;
    } else if (rest.startsWith('MM')) {
      source += '(\\d{2})';
      order.push('M');
      index += 2;
    } else if (rest.startsWith('M')) {
      source += '(\\d{1,2})';
      order.push('M');
      index += 1;
    } else if (rest.startsWith('dd')) {
      source += '(\\d{2})';
      order.push('d');
      index += 2;
    } else if (rest.startsWith('d')) {
      source += '(\\d{1,2})';
      order.push('d');
      index += 1;
    } else {
      source += format[index].replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      index += 1;
    }
  }

  return { pattern: new RegExp(`^${source}$`), order };
}

/**
 * Formats a date as ISO 8601 keeping the local offset, e.g.
 * `2026-09-24T00:00:00.000+02:00`.
 *
 * `Date.prototype.toISOString()` converts to UTC, which moves a local midnight
 * back to the previous day east of Greenwich; this keeps the calendar day the
 * user picked.
 */
export function formatIsoWithOffset(date: Date): string {
  const pad = (value: number, length = 2) => Math.abs(value).toString().padStart(length, '0');

  const offsetMinutes = -date.getTimezoneOffset();
  const sign = offsetMinutes < 0 ? '-' : '+';
  const offset = `${sign}${pad(Math.trunc(offsetMinutes / 60))}:${pad(offsetMinutes % 60)}`;

  const calendarDate = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  const time = `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}.${pad(date.getMilliseconds(), 3)}`;

  return `${calendarDate}T${time}${offset}`;
}

/**
 * Reads the calendar day out of an ISO 8601 string and returns it as a local
 * date, so the day never shifts through a time zone conversion.
 */
export function parseIsoDate(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,3}))?)?)?/.exec(value);
  if (!match) return null;

  const [, year, month, day, hours, minutes, seconds, milliseconds] = match;
  const date = new Date(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hours ?? 0),
    Number(minutes ?? 0),
    Number(seconds ?? 0),
    Number((milliseconds ?? '0').padEnd(3, '0')),
  );

  return isNaN(date.getTime()) ? null : date;
}

export function parseDate(value: string, format: string): Date | null {
  return parseDateDetailed(value, format).date;
}

export function isMonthDisabled(year: number, month: number, min: Date | null, max: Date | null): boolean {
  if (min) {
    const lastDayOfMonth = new Date(year, month + 1, 0);
    if (compareDates(lastDayOfMonth, min) < 0) return true;
  }
  if (max) {
    const firstDayOfMonth = new Date(year, month, 1);
    if (compareDates(firstDayOfMonth, max) > 0) return true;
  }
  return false;
}

export function isYearDisabled(year: number, min: Date | null, max: Date | null): boolean {
  if (min && year < min.getFullYear()) return true;
  if (max && year > max.getFullYear()) return true;
  return false;
}
