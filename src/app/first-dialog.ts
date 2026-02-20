import { Component } from '@angular/core';
import { DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';
import { DsDialogCdkService } from '@design-system';
import { SecondDialog } from './second-dialog';

@Component({
  selector: 'app-first-dialog',
  template: `
    <div style="padding: 24px; background: white; border-radius: 8px; max-width: 400px;">
      <h2>First Dialog</h2>
      <p>This is the first dialog. Try opening another one on top!</p>
      <div style="display: flex; gap: 8px; margin-top: 16px;">
        <button (click)="openSecondDialog()">Open Second Dialog</button>
        <button (click)="close()">Close</button>
      </div>
    </div>
  `,
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
