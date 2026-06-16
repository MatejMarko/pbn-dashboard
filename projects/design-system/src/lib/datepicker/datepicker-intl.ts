import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class DatepickerIntl {
  calendarLabel = 'Choose date';
  prevMonthLabel = 'Previous month';
  nextMonthLabel = 'Next month';
  prevYearLabel = 'Previous year';
  nextYearLabel = 'Next year';
  prevYearRangeLabel = 'Previous 12 years';
  nextYearRangeLabel = 'Next 12 years';
  switchToMonthViewLabel = 'Switch to month view';
  switchToYearViewLabel = 'Switch to year view';
}
