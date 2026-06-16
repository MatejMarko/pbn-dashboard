import {
  Directive,
  ElementRef,
  inject,
  input,
  OnDestroy,
  signal,
} from '@angular/core';
import { NgControl } from '@angular/forms';
import { DatepickerService } from './datepicker.service';
import { DatepickerRef } from './datepicker-ref';
import { CalendarComponent } from './calendar.component';
import { formatDate, parseDate } from './date-utils';

@Directive({
  selector: '[otpDatepickerTrigger]',
  host: {
    '[attr.aria-haspopup]': '"dialog"',
    '[attr.aria-expanded]': 'isOpen()',
    '[attr.autocomplete]': 'isInput ? "off" : null',
    '(click)': 'open()',
    '(keydown)': 'onKeydown($event)',
    '(input)': 'onInputChange($event)',
  },
})
export class DatepickerTriggerDirective implements OnDestroy {
  readonly otpDatepickerTrigger = input.required<CalendarComponent>();
  readonly dateFormat = input('dd.MM.yyyy');

  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private readonly datepickerService = inject(DatepickerService);
  private readonly ngControl = inject(NgControl, { optional: true, self: true });

  readonly isOpen = signal(false);
  readonly isInput: boolean;

  private datepickerRef: DatepickerRef | null = null;

  constructor() {
    const tag = this.elementRef.nativeElement.tagName.toLowerCase();
    this.isInput = tag === 'input' || tag === 'textarea';
  }

  open(): void {
    if (this.isOpen()) return;

    const calendar = this.otpDatepickerTrigger();

    this.datepickerRef = this.datepickerService.open({
      origin: this.elementRef,
      selected: this.resolveSelected(calendar),
      min: calendar.min(),
      max: calendar.max(),
      fixedWeeks: calendar.fixedWeeks(),
    });

    this.isOpen.set(true);

    this.datepickerRef.afterClosed().subscribe(date => {
      this.isOpen.set(false);
      this.datepickerRef = null;

      if (date) {
        calendar.dateSelected.emit(date);

        if (this.isInput && this.ngControl?.control) {
          this.ngControl.control.setValue(date);
          this.ngControl.control.markAsTouched();
          this.updateInputText(date);
        }
      }
    });
  }

  close(): void {
    this.datepickerRef?.close(null);
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.altKey && event.key === 'ArrowDown') {
      event.preventDefault();
      this.open();
    }
  }

  onInputChange(event: Event): void {
    if (!this.isInput) return;

    const value = (event.target as HTMLInputElement).value;
    const parsed = parseDate(value, this.dateFormat());

    if (parsed && this.ngControl?.control) {
      this.ngControl.control.setValue(parsed, { emitEvent: true });
    }
  }

  ngOnDestroy(): void {
    this.datepickerRef?.close(null);
  }

  /**
   * Resolves the selected date to pass to the datepicker.
   * When on an input with a form control, the control value takes priority.
   * Otherwise, falls back to the calendar's `selected` input.
   */
  private resolveSelected(calendar: CalendarComponent): Date | null {
    if (this.isInput && this.ngControl?.control) {
      const value = this.ngControl.control.value;
      if (value instanceof Date) return value;
      if (typeof value === 'string') return parseDate(value, this.dateFormat());
    }
    return calendar.selected();
  }

  private updateInputText(date: Date): void {
    const el = this.elementRef.nativeElement as HTMLInputElement;
    el.value = formatDate(date, this.dateFormat());
  }
}
