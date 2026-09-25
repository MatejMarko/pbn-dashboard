import { FormFieldComponent } from './form-field.component';
import { InputComponent } from '../input/input.component';
import { LabelDirective } from './directives/label.directive';
import { ErrorDirective } from './directives/error.directive';
import { HintDirective } from './directives/hint.directive';
import { HintRightDirective } from './directives/hint-right.directive';

export * from './form-field.component';
export * from './directives/label.directive';
export * from './directives/error.directive';
export * from './directives/hint.directive';
export * from './directives/hint-right.directive';

/** All form field directives needed to use `<otp-form-field>`. */
export const OTP_FORM_FIELD = [FormFieldComponent, InputComponent, LabelDirective, ErrorDirective, HintDirective, HintRightDirective] as const;

export {
  OTP_ERROR_STATE_MATCHER,
  defaultErrorStateMatcher,
  type ErrorStateMatcher,
} from './error-state-matcher';
