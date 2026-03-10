import { Component } from '@angular/core';
import { DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';
import { DialogComponent, DsButton, DsDialogCdkService, IconBackground } from '@design-system';
import { SecondDialog } from './second-dialog';

@Component({
  selector: 'app-first-dialog',
  template: `
    <lib-dialog-component>
      <otp-icon-background icon="OTP-icon-24x24-info" size="48" type="warning"></otp-icon-background>
      <ng-container dialogTitle>First Dialog</ng-container>
      <ng-container dialogDescription>This is the first dialog. Try opening another one on top!</ng-container>
      <ng-container dialogActions>
        <button (click)="openSecondDialog()" ds-button size="lg" variant="primary" color="green">Open Second Dialog</button>
      </ng-container>
    </lib-dialog-component>
  `,
  imports: [
    DialogComponent,
    DsButton,
    IconBackground
  ]
})
export class FirstDialog {
  constructor(
    private readonly dialogRef: DialogRef,
    private readonly dialogService: DsDialogCdkService,
  ) {}

  openSecondDialog(): void {
    this.dialogService.open(SecondDialog);
  }

  close(): void {
    this.dialogRef.close('first-result');
  }
}
