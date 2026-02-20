import { InjectionToken } from '@angular/core';

export interface DsDialogConfig<D = unknown> {
  /** Data to pass to the dialog component */
  data?: D;

  /** Whether clicking the backdrop closes the dialog */
  disableClose?: boolean;

  /** Width of the dialog (CSS value) */
  width?: string;

  /** Max width of the dialog (CSS value) */
  maxWidth?: string;

  /** Height of the dialog (CSS value) */
  height?: string;

  /** Whether the dialog has a backdrop */
  hasBackdrop?: boolean;

  /** Custom CSS class(es) for the backdrop */
  backdropClass?: string | string[];

  /** Custom CSS class(es) for the dialog panel */
  panelClass?: string | string[];

  /** Whether to auto-focus the first focusable element */
  autoFocus?: boolean;

  /** Whether to restore focus to the previously focused element on close */
  restoreFocus?: boolean;
}

export const DS_DIALOG_DATA = new InjectionToken<unknown>('DsDialogData');
