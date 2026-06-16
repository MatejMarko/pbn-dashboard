import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
  viewChild,
  ViewEncapsulation,
} from '@angular/core';
import { A11yModule } from '@angular/cdk/a11y';
import { DATEPICKER_DATA } from '../datepicker-context';
import { DatepickerIntl } from '../datepicker-intl';
import { addMonths, addYears, getYearRange } from '../date-utils';
import { SvgComponent } from '../../svg/svg';
import { SvgNames } from '../../svg/svg-names.enum';
import { DayViewComponent } from './day-view.component';
import { MonthViewComponent } from './month-view.component';
import { YearViewComponent } from './year-view.component';

type PanelView = 'day' | 'month' | 'year';

@Component({
  selector: 'otp-datepicker-panel',
  templateUrl: './datepicker-panel.component.html',
  styleUrl: './datepicker-panel.component.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [A11yModule, SvgComponent, DayViewComponent, MonthViewComponent, YearViewComponent],
  host: {
    'role': 'dialog',
    'aria-modal': 'true',
    '[attr.aria-label]': 'intl.calendarLabel',
    '(keydown.escape)': 'onEscape()',
  },
})
export class DatepickerPanelComponent {
  readonly intl = inject(DatepickerIntl);
  private readonly data = inject(DATEPICKER_DATA);

  readonly SvgNames = SvgNames;

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

  readonly headerLabel = computed(() => {
    const d = this.activeDate();
    const view = this.currentView();
    if (view === 'day') {
      return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }
    if (view === 'month') {
      return d.getFullYear().toString();
    }
    const { start, end } = getYearRange(d.getFullYear());
    return `${start} – ${end}`;
  });

  readonly prevButtonLabel = computed(() => {
    const view = this.currentView();
    if (view === 'day') return this.intl.prevMonthLabel;
    if (view === 'month') return this.intl.prevYearLabel;
    return this.intl.prevYearRangeLabel;
  });

  readonly nextButtonLabel = computed(() => {
    const view = this.currentView();
    if (view === 'day') return this.intl.nextMonthLabel;
    if (view === 'month') return this.intl.nextYearLabel;
    return this.intl.nextYearRangeLabel;
  });

  constructor() {
    const sel = this.data.selected();
    if (sel) {
      this.activeDate.set(new Date(sel));
    }
  }

  onHeaderLabelClick(): void {
    const view = this.currentView();
    if (view === 'day') {
      this.currentView.set('month');
      this.announce(this.intl.switchToMonthViewLabel);
      queueMicrotask(() => this.monthView()?.focusInitial());
    } else if (view === 'month') {
      this.currentView.set('year');
      this.announce(this.intl.switchToYearViewLabel);
      queueMicrotask(() => this.yearView()?.focusInitial());
    }
  }

  onPrev(): void {
    const view = this.currentView();
    if (view === 'day') {
      this.activeDate.update(d => addMonths(d, -1));
    } else if (view === 'month') {
      this.activeDate.update(d => addYears(d, -1));
    } else {
      this.yearView()?.prevPage();
    }
    this.announce(this.headerLabel());
  }

  onNext(): void {
    const view = this.currentView();
    if (view === 'day') {
      this.activeDate.update(d => addMonths(d, 1));
    } else if (view === 'month') {
      this.activeDate.update(d => addYears(d, 1));
    } else {
      this.yearView()?.nextPage();
    }
    this.announce(this.headerLabel());
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
    this.activeDate.set(date);
    this.announce(this.headerLabel());
  }

  onEscape(): void {
    this.data.close(null);
  }

  focusInitial(): void {
    queueMicrotask(() => this.dayView()?.focusInitial());
  }

  isHeaderClickable(): boolean {
    return this.currentView() !== 'year';
  }

  private announce(message: string): void {
    this.liveAnnouncement.set('');
    queueMicrotask(() => this.liveAnnouncement.set(message));
  }
}
