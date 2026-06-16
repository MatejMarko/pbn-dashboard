export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

export function getFirstDayOfWeek(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
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

export function clampDate(date: Date, min: Date | null, max: Date | null): Date {
  if (min && compareDates(date, min) < 0) return new Date(min);
  if (max && compareDates(date, max) > 0) return new Date(max);
  return new Date(date);
}

export function formatDate(date: Date, format: string): string {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear().toString();

  return format
    .replace('dd', day)
    .replace('MM', month)
    .replace('yyyy', year);
}

export function parseDate(value: string, format: string): Date | null {
  const ddIndex = format.indexOf('dd');
  const mmIndex = format.indexOf('MM');
  const yyyyIndex = format.indexOf('yyyy');

  if (ddIndex === -1 || mmIndex === -1 || yyyyIndex === -1) return null;
  if (value.length !== format.length) return null;

  const dayStr = value.substring(ddIndex, ddIndex + 2);
  const monthStr = value.substring(mmIndex, mmIndex + 2);
  const yearStr = value.substring(yyyyIndex, yyyyIndex + 4);

  const day = parseInt(dayStr, 10);
  const month = parseInt(monthStr, 10);
  const year = parseInt(yearStr, 10);

  if (isNaN(day) || isNaN(month) || isNaN(year)) return null;
  if (month < 1 || month > 12) return null;
  if (day < 1 || day > getDaysInMonth(year, month - 1)) return null;

  return new Date(year, month - 1, day);
}

export function getYearRange(year: number, pageSize = 12): { start: number; end: number } {
  const start = year - (year % pageSize);
  return { start, end: start + pageSize - 1 };
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
