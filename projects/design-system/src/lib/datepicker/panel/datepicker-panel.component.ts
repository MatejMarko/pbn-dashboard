import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
  viewChild,
  ViewEncapsulation,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { A11yModule } from '@angular/cdk/a11y';
import { DATEPICKER_DATA } from '../datepicker-context';
import { DatepickerIntl } from '../datepicker-intl';
import { isSameMonth, startOfMonth } from '../date-utils';
import { SvgComponent } from '../../svg/svg';
import { SvgNames } from '../../svg/svg-names.enum';
import { DayViewComponent } from './day-view/day-view.component';
import { MonthViewComponent } from './month-view/month-view.component';
import { YearViewComponent } from './year-view/year-view.component';

type PanelView = 'day' | 'month' | 'year';

@Component({
  selector: 'otp-datepicker-panel',
  templateUrl: './datepicker-panel.component.html',
  styleUrl: './datepicker-panel.component.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NgTemplateOutlet,
    A11yModule,
    SvgComponent,
    DayViewComponent,
    MonthViewComponent,
    YearViewComponent,
  ],
  host: {
    'role': 'dialog',
    'aria-modal': 'true',
    '[attr.aria-label]': 'intl.calendarLabel()',
    '(keydown.escape)': 'onEscape()',
  },
})
export class DatepickerPanelComponent {
  readonly intl = inject(DatepickerIntl);
  private readonly data = inject(DATEPICKER_DATA);

  readonly SvgNames = SvgNames;

  /**
   * Where the panel ended up relative to its trigger. Set by the service from
   * the overlay's position changes; the caret only shows when it opened below.
   */
  readonly placement = signal<'below' | 'above'>('below');

  readonly currentView = signal<PanelView>('day');
  readonly activeDate = signal(new Date());

  readonly selected = this.data.selected;
  readonly min = this.data.min;
  readonly max = this.data.max;
  readonly fixedWeeks = this.data.fixedWeeks;

  readonly liveAnnouncement = signal('');

  private readonly dayView = viewChild(DayViewComponent);
  private readonly monthView = viewChild(MonthViewComponent);
  private readonly yearView = viewChild(YearViewComponent);

  /** Spoken summary of what the panel currently shows. */
  readonly headerLabel = computed(() => {
    const d = this.activeDate();
    return this.currentView() === 'day'
      ? this.intl.formatMonthYear(d)
      : d.getFullYear().toString();
  });

  /**
   * A day is only shown once it has actually been chosen — and only while the
   * month holding it is on screen. Browsing elsewhere, or opening with an empty
   * field, shows the calendar icon instead of claiming a day nobody picked.
   */
  readonly showDay = computed(() => {
    const selected = this.selected();
    return selected !== null && isSameMonth(selected, this.activeDate());
  });

  /** Day segment of the header, e.g. `01`. Only rendered when {@link showDay}. */
  readonly headerDay = computed(() => {
    const selected = this.selected();
    return selected ? selected.getDate().toString().padStart(2, '0') : '';
  });

  /** Month segment of the header, e.g. `January`. */
  readonly headerMonth = computed(() =>
    this.intl.monthsLong()[this.activeDate().getMonth()]
  );

  /** Year segment of the header, e.g. `2026`. */
  readonly headerYear = computed(() => this.activeDate().getFullYear().toString());

  constructor() {
    const sel = this.data.selected();
    if (sel) {
      this.activeDate.set(startOfMonth(sel));
    }
  }

  /**
   * Switches straight to the requested view. Each header segment
   * (day / month / year) opens its own picker, so a year can be chosen
   * without going through the month picker first.
   */
  setView(view: PanelView): void {
    if (this.currentView() === view) return;

    this.currentView.set(view);
    this.announce(this.segmentLabel(view));

    queueMicrotask(() => {
      if (view === 'day') this.dayView()?.focusInitial();
      else if (view === 'month') this.monthView()?.focusInitial();
      else this.yearView()?.focusInitial();
    });
  }

  onDateSelected(date: Date): void {
    this.data.close(date);
  }

  onMonthSelected(month: number): void {
    const d = this.activeDate();
    this.activeDate.set(new Date(d.getFullYear(), month, 1));
    this.currentView.set('day');
    this.announce(this.headerLabel());
    queueMicrotask(() => this.dayView()?.focusInitial());
  }

  onYearSelected(year: number): void {
    const d = this.activeDate();
    this.activeDate.set(new Date(year, d.getMonth(), 1));
    this.currentView.set('month');
    this.announce(this.headerLabel());
    queueMicrotask(() => this.monthView()?.focusInitial());
  }

  onActiveDateChange(date: Date): void {
    this.activeDate.set(startOfMonth(date));
    this.announce(this.headerLabel());
  }

  onEscape(): void {
    this.data.close(null);
  }

  focusInitial(): void {
    queueMicrotask(() => this.dayView()?.focusInitial());
  }

  isViewActive(view: PanelView): boolean {
    return this.currentView() === view;
  }

  segmentLabel(view: PanelView): string {
    if (view === 'day') return this.intl.switchToDayViewLabel();
    if (view === 'month') return this.intl.switchToMonthViewLabel();
    return this.intl.switchToYearViewLabel();
  }

  private announce(message: string): void {
    this.liveAnnouncement.set('');
    queueMicrotask(() => this.liveAnnouncement.set(message));
  }
}
