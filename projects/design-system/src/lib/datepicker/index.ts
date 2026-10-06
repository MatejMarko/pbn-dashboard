import { CalendarComponent } from './calendar/calendar.component';
import { DatepickerInputDirective } from './directives/datepicker-input.directive';
import { DatepickerToggleDirective } from './directives/datepicker-toggle.directive';
import { DateRangeComponent } from './date-range/date-range.component';

export { CalendarComponent, type DatepickerInputHost } from './calendar/calendar.component';
export { DatepickerInputDirective } from './directives/datepicker-input.directive';
export { DatepickerToggleDirective } from './directives/datepicker-toggle.directive';
export { DateRangeComponent } from './date-range/date-range.component';
export { type DatepickerValueFormat } from './directives/datepicker-input.directive';
export { DatepickerService, type DatepickerConfig } from './datepicker.service';
export { DatepickerRef } from './datepicker-ref';
export { DatepickerIntl } from './datepicker-intl';
export {
  DATEPICKER_TRANSLATIONS,
  resolveDatepickerLocale,
  type DatepickerLocale,
  type DatepickerTranslation,
} from './datepicker-translations';

export const OTP_DATEPICKER = [
  CalendarComponent,
  DatepickerInputDirective,
  DatepickerToggleDirective,
  DateRangeComponent,
] as const;
