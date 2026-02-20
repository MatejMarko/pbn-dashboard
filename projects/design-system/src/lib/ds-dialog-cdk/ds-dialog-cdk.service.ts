import { Injectable } from '@angular/core';
import { Dialog, DialogRef } from '@angular/cdk/dialog';
import { ComponentType } from '@angular/cdk/overlay';

import { DsDialogCdkConfig } from './ds-dialog-cdk-config';

const DS_DIALOG_DEFAULTS: Partial<DsDialogCdkConfig> = {
  hasBackdrop: true,
  backdropClass: 'ds-dialog-cdk-backdrop',
  width: '500px',
  maxWidth: '90vw',
  disableClose: false,
  autoFocus: 'first-tabbable',
  restoreFocus: true,
};

@Injectable({ providedIn: 'root' })
export class DsDialogCdkService {
  constructor(private readonly cdkDialog: Dialog) {}

  open<C, D = unknown, R = unknown>(
    component: ComponentType<C>,
    config?: DsDialogCdkConfig<D>,
  ): DialogRef<R, C> {
    const mergedConfig = { ...DS_DIALOG_DEFAULTS, ...config };
    return this.cdkDialog.open<R, D, C>(component, mergedConfig as any);
  }

  closeAll(): void {
    this.cdkDialog.closeAll();
  }

  getDialogById(id: string): DialogRef | undefined {
    return this.cdkDialog.getDialogById(id);
  }

  get openDialogs(): readonly DialogRef[] {
    return this.cdkDialog.openDialogs;
  }

  get afterAllClosed() {
    return this.cdkDialog.afterAllClosed;
  }
}
