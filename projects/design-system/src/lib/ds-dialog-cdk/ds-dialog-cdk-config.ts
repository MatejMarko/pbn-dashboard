import { DialogConfig } from '@angular/cdk/dialog';
import { DialogVariant } from './ds-dialog-cdk.service';

export interface DsDialogCdkConfig<D = unknown> extends DialogConfig<D> {
  /** Custom CSS class(es) for the dialog panel */
  panelClass?: string | string[];

  /** Custom CSS class(es) for the backdrop */
  backdropClass?: string | string[];

  /** DialogVariant (simple / complex) */
  dialogVariant?: DialogVariant | string[];
}
