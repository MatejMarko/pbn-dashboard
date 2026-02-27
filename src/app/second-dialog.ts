import { Component } from '@angular/core';
import { DialogRef } from '@angular/cdk/dialog';
import { DialogComponent, DsButton } from '@design-system';
import { SvgComponent } from '@design-system/lib/svg/svg';
import { IconBackground } from '@design-system/lib/icon-background/icon-background';

@Component({
  selector: 'app-second-dialog',
  imports: [DialogComponent, IconBackground, DsButton],
  template: `
    <lib-dialog-component [hasCloseIcon]="true">
      <otp-icon-background icon="OTP-icon-24x24-info" size="48" type="success"></otp-icon-background>
      <ng-container dialogTitle>Second Dialog</ng-container>
      <ng-container  dialogDescription>This is stacked on top of the first dialog.</ng-container>
      <ng-container dialogActions>
        <button (click)="close()" ds-button size="lg" variant="primary" color="green">This one has long</button>
        <button (click)="close()" ds-button size="lg" variant="secondary" color="green">Close</button>
      </ng-container>
    </lib-dialog-component>
  `,
})
export class SecondDialog {
  constructor(private readonly dialogRef: DialogRef) {}

  close(): void {
    this.dialogRef.close('second-result');
  }
}
