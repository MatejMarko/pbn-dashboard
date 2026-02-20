import { DialogConfig } from '@angular/cdk/dialog';

export interface DsDialogCdkConfig<D = unknown> extends DialogConfig<D> {
  /** Custom CSS class(es) for the dialog panel */
  panelClass?: string | string[];

  /** Custom CSS class(es) for the backdrop */
  backdropClass?: string | string[];
}
