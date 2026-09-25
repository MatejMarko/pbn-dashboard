import { InjectionToken } from '@angular/core';
import { AbstractControl } from '@angular/forms';

/**
 * Decides *when* a field shows its error state (red label and border,
 * `aria-invalid`). Validity itself is always computed by the control's
 * validators; this only governs display.
 *
 * Provide a different matcher on a form, a dialog or a single field to defer
 * errors until a submit or an "Apply" click.
 */
export interface ErrorStateMatcher {
  isErrorState(control: AbstractControl | null): boolean;
}

/** Shows errors once the control is invalid and the user has left it. */
export const defaultErrorStateMatcher: ErrorStateMatcher = {
  isErrorState: control => !!control && control.invalid && control.touched,
};

export const OTP_ERROR_STATE_MATCHER = new InjectionToken<ErrorStateMatcher>(
  'OTP_ERROR_STATE_MATCHER',
  {
    providedIn: 'root',
    factory: () => defaultErrorStateMatcher,
  },
);
