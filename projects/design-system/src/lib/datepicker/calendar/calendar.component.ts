import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  OnDestroy,
  output,
  signal,
} from '@angular/core';
import { DatepickerRef } from '../datepicker-ref';
import { OTP_DATEPICKER_VALUE_ADAPTER } from '../datepicker-value-adapter';
import { parseIsoDate } from '../date-utils';
import { DatepickerService } from '../datepicker.service';

/** What the calendar needs from the input it writes into. */
export interface DatepickerInputHost {
  /** Element the overlay is anchored to. */
  readonly element: HTMLElement;
  /** Whether the field currently refuses input. Readonly fields still open. */
  readonly disabled: boolean;
  /** Current value of the field, if it holds a valid date. */
  readDate(): Date | null;
  /** Writes a picked date back into the field. */
  writeDate(date: Date): void;
}

/**
 * Holds the datepicker's configuration and owns the overlay. It renders
 * nothing: it is the link between a `[otpDatepickerInput]` field and whatever
 * carries `[otpDatepickerToggle]`.
 */
@Component({
  selector: 'otp-calendar',
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalendarComponent implements OnDestroy {
  /**
   * `selected`, `min` and `max` accept whatever date type the application uses
   * — a `Date`, an ISO string, or its own type when an
   * {@link OTP_DATEPICKER_VALUE_ADAPTER} is provided.
   */
  readonly selected = input<unknown>(null);
  readonly min = input<unknown>(null);
  readonly max = input<unknown>(null);
  readonly fixedWeeks = input(true);

  /** The picked day, in the application's date type. */
  readonly dateSelected = output<unknown>();

  private readonly datepickerService = inject(DatepickerService);
  private readonly valueAdapter = inject(OTP_DATEPICKER_VALUE_ADAPTER);

  /** The inputs above as native dates, which is what the panel works with. */
  readonly selectedDate = computed(() => this.toDate(this.selected()));
  readonly minDate = computed(() => this.toDate(this.min()));
  readonly maxDate = computed(() => this.toDate(this.max()));

  private readonly openState = signal(false);
  readonly isOpen = this.openState.asReadonly();

  private datepickerRef: DatepickerRef | null = null;
  private inputHost: DatepickerInputHost | null = null;
  private triggerElement: HTMLElement | null = null;

  registerInput(host: DatepickerInputHost): void {
    if ((typeof ngDevMode === 'undefined' || ngDevMode) && this.inputHost && this.inputHost !== host) {
      console.warn('otp-calendar: a calendar can only be attached to one otpDatepickerInput.');
    }
    this.inputHost = host;
  }

  unregisterInput(host: DatepickerInputHost): void {
    if (this.inputHost === host) {
      this.inputHost = null;
    }
  }

  /**
   * The element the caret points at. Registered by `[otpDatepickerToggle]` so
   * that opening with Alt+ArrowDown lands in the same place as a click.
   */
  registerToggle(element: HTMLElement): void {
    this.triggerElement = element;
  }

  unregisterToggle(element: HTMLElement): void {
    if (this.triggerElement === element) {
      this.triggerElement = null;
    }
  }

  /**
   * Opens the calendar, anchored to the trigger when one is registered so the
   * caret points at it. Without a trigger it falls back to the form field (or
   * the input), and the panel simply overhangs the field's right edge.
   */
  open(fallbackOrigin?: ElementRef<HTMLElement> | HTMLElement): void {
    if (this.isOpen()) return;

    const host = this.inputHost;
    if (host?.disabled) return;

    const trigger = this.triggerElement
      ?? (fallbackOrigin instanceof ElementRef ? fallbackOrigin.nativeElement : fallbackOrigin);
    const origin = trigger ?? this.fieldOf(host);

    if (!origin) {
      if (typeof ngDevMode === 'undefined' || ngDevMode) {
        console.warn('otp-calendar: nothing to anchor the calendar to. Add [otpDatepickerInput] to an input or open it from an element.');
      }
      return;
    }

    this.datepickerRef = this.datepickerService.open({
      origin,
      anchor: trigger ? 'trigger' : 'field',
      selected: host?.readDate() ?? this.selectedDate(),
      min: this.minDate(),
      max: this.maxDate(),
      fixedWeeks: this.fixedWeeks(),
    });

    this.openState.set(true);

    this.datepickerRef.afterClosed().subscribe(date => {
      this.openState.set(false);
      this.datepickerRef = null;

      if (date) {
        this.dateSelected.emit(this.valueAdapter ? this.valueAdapter.fromDate(date) : date);
        host?.writeDate(date);
      }
    });
  }

  close(): void {
    this.datepickerRef?.close(null);
  }

  toggle(fallbackOrigin?: ElementRef<HTMLElement> | HTMLElement): void {
    if (this.isOpen()) {
      this.close();
    } else {
      this.open(fallbackOrigin);
    }
  }

  ngOnDestroy(): void {
    this.datepickerRef?.close(null);
  }

  /** Reads an input value through the adapter, falling back to Date / ISO. */
  private toDate(value: unknown): Date | null {
    if (value == null) return null;
    if (this.valueAdapter) return this.valueAdapter.toDate(value);
    if (value instanceof Date) return isNaN(value.getTime()) ? null : value;
    if (typeof value === 'string' && value !== '') return parseIsoDate(value);
    return null;
  }

  /** The form field around the input, so the panel clears the whole field. */
  private fieldOf(host: DatepickerInputHost | null): HTMLElement | undefined {
    if (!host) return undefined;
    return host.element.closest('otp-form-field') as HTMLElement | null ?? host.element;
  }
}
