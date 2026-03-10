import { DsFormField } from './ds-form-field';
import { DsInput } from '../ds-input/ds-input';
import { DsLabel } from './directives/ds-label';
import { DsError } from './directives/ds-error';
import { DsHint } from './directives/ds-hint';
import { DsHintRight } from './directives/ds-hint-right';

export * from './ds-form-field';
export * from './directives/ds-label';
export * from './directives/ds-error';
export * from './directives/ds-hint';
export * from './directives/ds-hint-right';

/** All form field directives needed to use `<ds-form-field>`. */
export const DS_FORM_FIELD = [DsFormField, DsInput, DsLabel, DsError, DsHint, DsHintRight] as const;
