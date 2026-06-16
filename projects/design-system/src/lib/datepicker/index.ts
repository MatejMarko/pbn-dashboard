import { CalendarComponent } from './calendar.component';
import { DatepickerTriggerDirective } from './datepicker-trigger.directive';

export { CalendarComponent } from './calendar.component';
export { DatepickerTriggerDirective } from './datepicker-trigger.directive';
export { DatepickerService, type DatepickerConfig } from './datepicker.service';
export { DatepickerRef } from './datepicker-ref';
export { DatepickerIntl } from './datepicker-intl';

export const OTP_DATEPICKER = [
  CalendarComponent,
  DatepickerTriggerDirective,
] as const;
