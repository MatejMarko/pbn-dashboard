import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'otp-calendar',
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalendarComponent {
  readonly selected = input<Date | null>(null);
  readonly min = input<Date | null>(null);
  readonly max = input<Date | null>(null);
  readonly fixedWeeks = input(true);

  readonly dateSelected = output<Date>();
}
