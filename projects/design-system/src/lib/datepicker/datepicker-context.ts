import { InjectionToken, WritableSignal } from '@angular/core';

export interface DatepickerData {
  selected: WritableSignal<Date | null>;
  min: WritableSignal<Date | null>;
  max: WritableSignal<Date | null>;
  fixedWeeks: WritableSignal<boolean>;
  close: (date: Date | null) => void;
}

export const DATEPICKER_DATA = new InjectionToken<DatepickerData>('DATEPICKER_DATA');
