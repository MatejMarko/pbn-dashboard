import {
  getDaysInMonth,
  getFirstDayOfWeek,
  getMonthGrid,
  isSameDay,
  isSameMonth,
  compareDates,
  isDateInRange,
  addMonths,
  addYears,
  clampDate,
  formatDate,
  parseDate,
  getYearRange,
  isMonthDisabled,
  isYearDisabled,
} from './date-utils';

describe('date-utils', () => {
  describe('getDaysInMonth', () => {
    it('should return 31 for January', () => {
      expect(getDaysInMonth(2026, 0)).toBe(31);
    });

    it('should return 28 for February in a non-leap year', () => {
      expect(getDaysInMonth(2025, 1)).toBe(28);
    });

    it('should return 29 for February in a leap year', () => {
      expect(getDaysInMonth(2024, 1)).toBe(29);
    });

    it('should return 30 for April', () => {
      expect(getDaysInMonth(2026, 3)).toBe(30);
    });
  });

  describe('getFirstDayOfWeek', () => {
    it('should return the correct day of week for the first of the month', () => {
      // 2026-01-01 is a Thursday (4)
      expect(getFirstDayOfWeek(2026, 0)).toBe(4);
    });
  });

  describe('getMonthGrid', () => {
    it('should return a 6x7 grid', () => {
      const grid = getMonthGrid(2026, 0);
      expect(grid.length).toBe(6);
      grid.forEach(row => expect(row.length).toBe(7));
    });

    it('should start with Monday by default', () => {
      const grid = getMonthGrid(2026, 0); // January 2026
      // First row, first cell should be Monday
      expect(grid[0][0].getDay()).toBe(1); // Monday
    });

    it('should include leading days from previous month', () => {
      // January 2026 starts on Thursday. With Monday start, we need Mon-Wed from December 2025.
      const grid = getMonthGrid(2026, 0);
      expect(grid[0][0].getMonth()).toBe(11); // December
      expect(grid[0][0].getDate()).toBe(29);
    });

    it('should include trailing days from next month', () => {
      const grid = getMonthGrid(2026, 0);
      // Last row should have days from February
      const lastRow = grid[5];
      expect(lastRow[lastRow.length - 1].getMonth()).toBe(1); // February
    });

    it('should support Sunday as first day of week', () => {
      const grid = getMonthGrid(2026, 0, 0);
      expect(grid[0][0].getDay()).toBe(0); // Sunday
    });
  });

  describe('isSameDay', () => {
    it('should return true for same day with different times', () => {
      const a = new Date(2026, 0, 15, 10, 30);
      const b = new Date(2026, 0, 15, 22, 0);
      expect(isSameDay(a, b)).toBe(true);
    });

    it('should return false for adjacent days', () => {
      const a = new Date(2026, 0, 15);
      const b = new Date(2026, 0, 16);
      expect(isSameDay(a, b)).toBe(false);
    });
  });

  describe('isSameMonth', () => {
    it('should return true for same month', () => {
      expect(isSameMonth(new Date(2026, 3, 1), new Date(2026, 3, 28))).toBe(true);
    });

    it('should return false for different months', () => {
      expect(isSameMonth(new Date(2026, 3, 1), new Date(2026, 4, 1))).toBe(false);
    });
  });

  describe('compareDates', () => {
    it('should return negative when a is before b', () => {
      expect(compareDates(new Date(2026, 0, 1), new Date(2026, 0, 2))).toBeLessThan(0);
    });

    it('should return positive when a is after b', () => {
      expect(compareDates(new Date(2026, 0, 2), new Date(2026, 0, 1))).toBeGreaterThan(0);
    });

    it('should return 0 for same day', () => {
      expect(compareDates(new Date(2026, 0, 1, 10), new Date(2026, 0, 1, 22))).toBe(0);
    });
  });

  describe('isDateInRange', () => {
    const min = new Date(2026, 0, 10);
    const max = new Date(2026, 0, 20);

    it('should return true when inside range', () => {
      expect(isDateInRange(new Date(2026, 0, 15), min, max)).toBe(true);
    });

    it('should return true on min boundary', () => {
      expect(isDateInRange(new Date(2026, 0, 10), min, max)).toBe(true);
    });

    it('should return true on max boundary', () => {
      expect(isDateInRange(new Date(2026, 0, 20), min, max)).toBe(true);
    });

    it('should return false before min', () => {
      expect(isDateInRange(new Date(2026, 0, 9), min, max)).toBe(false);
    });

    it('should return false after max', () => {
      expect(isDateInRange(new Date(2026, 0, 21), min, max)).toBe(false);
    });

    it('should return true when min is null', () => {
      expect(isDateInRange(new Date(2020, 0, 1), null, max)).toBe(true);
    });

    it('should return true when max is null', () => {
      expect(isDateInRange(new Date(2030, 0, 1), min, null)).toBe(true);
    });

    it('should return true when both are null', () => {
      expect(isDateInRange(new Date(2026, 0, 15), null, null)).toBe(true);
    });
  });

  describe('addMonths', () => {
    it('should add months correctly', () => {
      const result = addMonths(new Date(2026, 0, 15), 2);
      expect(result.getMonth()).toBe(2);
      expect(result.getDate()).toBe(15);
    });

    it('should handle Jan 31 + 1 month (clamp to Feb 28)', () => {
      const result = addMonths(new Date(2026, 0, 31), 1);
      expect(result.getMonth()).toBe(1);
      expect(result.getDate()).toBe(28);
    });

    it('should handle December + 1 = January next year', () => {
      const result = addMonths(new Date(2026, 11, 15), 1);
      expect(result.getFullYear()).toBe(2027);
      expect(result.getMonth()).toBe(0);
    });

    it('should subtract months with negative amount', () => {
      const result = addMonths(new Date(2026, 2, 15), -1);
      expect(result.getMonth()).toBe(1);
    });
  });

  describe('addYears', () => {
    it('should add years correctly', () => {
      const result = addYears(new Date(2026, 5, 15), 2);
      expect(result.getFullYear()).toBe(2028);
      expect(result.getMonth()).toBe(5);
    });

    it('should handle Feb 29 + 1 year (clamp to Feb 28)', () => {
      const result = addYears(new Date(2024, 1, 29), 1);
      expect(result.getMonth()).toBe(1);
      expect(result.getDate()).toBe(28);
    });
  });

  describe('clampDate', () => {
    it('should return the date when in range', () => {
      const date = new Date(2026, 0, 15);
      const result = clampDate(date, new Date(2026, 0, 1), new Date(2026, 0, 31));
      expect(isSameDay(result, date)).toBe(true);
    });

    it('should return min when date is before min', () => {
      const min = new Date(2026, 0, 10);
      const result = clampDate(new Date(2026, 0, 5), min, null);
      expect(isSameDay(result, min)).toBe(true);
    });

    it('should return max when date is after max', () => {
      const max = new Date(2026, 0, 20);
      const result = clampDate(new Date(2026, 0, 25), null, max);
      expect(isSameDay(result, max)).toBe(true);
    });
  });

  describe('formatDate', () => {
    it('should format with dd.MM.yyyy', () => {
      expect(formatDate(new Date(2026, 0, 5), 'dd.MM.yyyy')).toBe('05.01.2026');
    });

    it('should format with yyyy-MM-dd', () => {
      expect(formatDate(new Date(2026, 11, 25), 'yyyy-MM-dd')).toBe('2026-12-25');
    });

    it('should format with dd/MM/yyyy', () => {
      expect(formatDate(new Date(2026, 5, 15), 'dd/MM/yyyy')).toBe('15/06/2026');
    });
  });

  describe('parseDate', () => {
    it('should parse dd.MM.yyyy format', () => {
      const result = parseDate('15.01.2026', 'dd.MM.yyyy');
      expect(result).not.toBeNull();
      expect(result!.getFullYear()).toBe(2026);
      expect(result!.getMonth()).toBe(0);
      expect(result!.getDate()).toBe(15);
    });

    it('should parse yyyy-MM-dd format', () => {
      const result = parseDate('2026-12-25', 'yyyy-MM-dd');
      expect(result).not.toBeNull();
      expect(result!.getMonth()).toBe(11);
      expect(result!.getDate()).toBe(25);
    });

    it('should return null for invalid string', () => {
      expect(parseDate('invalid', 'dd.MM.yyyy')).toBeNull();
    });

    it('should return null for wrong length', () => {
      expect(parseDate('1.1.2026', 'dd.MM.yyyy')).toBeNull();
    });

    it('should return null for invalid month', () => {
      expect(parseDate('15.13.2026', 'dd.MM.yyyy')).toBeNull();
    });

    it('should return null for invalid day', () => {
      expect(parseDate('32.01.2026', 'dd.MM.yyyy')).toBeNull();
    });

    it('should return null for Feb 29 in non-leap year', () => {
      expect(parseDate('29.02.2025', 'dd.MM.yyyy')).toBeNull();
    });

    it('should accept Feb 29 in leap year', () => {
      const result = parseDate('29.02.2024', 'dd.MM.yyyy');
      expect(result).not.toBeNull();
      expect(result!.getDate()).toBe(29);
    });

    it('should round-trip with formatDate', () => {
      const original = new Date(2026, 5, 15);
      const formatted = formatDate(original, 'dd.MM.yyyy');
      const parsed = parseDate(formatted, 'dd.MM.yyyy');
      expect(parsed).not.toBeNull();
      expect(isSameDay(parsed!, original)).toBe(true);
    });
  });

  describe('getYearRange', () => {
    it('should return range starting at nearest multiple of pageSize', () => {
      expect(getYearRange(2026)).toEqual({ start: 2024, end: 2035 });
    });

    it('should return range for exact multiple', () => {
      expect(getYearRange(2024)).toEqual({ start: 2024, end: 2035 });
    });

    it('should support custom page size', () => {
      expect(getYearRange(2026, 10)).toEqual({ start: 2020, end: 2029 });
    });
  });

  describe('isMonthDisabled', () => {
    it('should return true when entire month is before min', () => {
      expect(isMonthDisabled(2026, 0, new Date(2026, 1, 1), null)).toBe(true);
    });

    it('should return false when month overlaps with min', () => {
      expect(isMonthDisabled(2026, 0, new Date(2026, 0, 15), null)).toBe(false);
    });

    it('should return true when entire month is after max', () => {
      expect(isMonthDisabled(2026, 2, null, new Date(2026, 1, 28))).toBe(true);
    });

    it('should return false when month overlaps with max', () => {
      expect(isMonthDisabled(2026, 1, null, new Date(2026, 1, 15))).toBe(false);
    });

    it('should return false when no constraints', () => {
      expect(isMonthDisabled(2026, 5, null, null)).toBe(false);
    });
  });

  describe('isYearDisabled', () => {
    it('should return true when year is before min year', () => {
      expect(isYearDisabled(2025, new Date(2026, 0, 1), null)).toBe(true);
    });

    it('should return true when year is after max year', () => {
      expect(isYearDisabled(2027, null, new Date(2026, 11, 31))).toBe(true);
    });

    it('should return false when year matches min year', () => {
      expect(isYearDisabled(2026, new Date(2026, 6, 1), null)).toBe(false);
    });

    it('should return false when no constraints', () => {
      expect(isYearDisabled(2026, null, null)).toBe(false);
    });
  });
});
