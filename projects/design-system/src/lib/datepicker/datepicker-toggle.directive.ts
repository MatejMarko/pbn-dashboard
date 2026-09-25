import { afterNextRender, Directive, ElementRef, inject, input, OnDestroy, OnInit } from '@angular/core';
import { CalendarComponent } from './calendar.component';
import { DatepickerIntl } from './datepicker-intl';

/**
 * Opens an `<otp-calendar>` from whatever element it sits on — usually a suffix
 * icon button inside `<otp-form-field>`, but it works on any element, including
 * the input itself when click-to-open is wanted.
 */
@Directive({
  selector: '[otpDatepickerToggle]',
  host: {
    '[attr.type]': 'isButton ? "button" : null',
    '[attr.aria-haspopup]': '"dialog"',
    '[attr.aria-expanded]': 'calendar().isOpen()',
    '(click)': 'onClick($event)',
  },
})
export class DatepickerToggleDirective implements OnInit, OnDestroy {
  readonly calendar = input.required<CalendarComponent>({ alias: 'otpDatepickerToggle' });

  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private readonly intl = inject(DatepickerIntl);

  readonly isButton: boolean;

  constructor() {
    this.isButton = this.elementRef.nativeElement.tagName.toLowerCase() === 'button';

    // Falls back to a localized label only when the host has none of its own,
    // so an icon-only toggle is never announced as an unlabelled button.
    afterNextRender(() => {
      const element = this.elementRef.nativeElement;
      const hasOwnLabel =
        element.hasAttribute('aria-label')
        || element.hasAttribute('aria-labelledby')
        || (element.textContent ?? '').trim().length > 0;

      if (!hasOwnLabel) {
        element.setAttribute('aria-label', this.intl.calendarLabel());
      }
    });
  }

  ngOnInit(): void {
    // Lets the calendar aim its caret here even when opened from the keyboard.
    this.calendar().registerToggle(this.elementRef.nativeElement);
  }

  ngOnDestroy(): void {
    this.calendar().unregisterToggle(this.elementRef.nativeElement);
  }

  onClick(event: Event): void {
    event.preventDefault();
    this.calendar().toggle(this.elementRef);
  }
}
