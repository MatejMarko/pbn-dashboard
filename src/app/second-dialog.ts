import { Component } from '@angular/core';
import { DialogRef } from '@angular/cdk/dialog';

@Component({
  selector: 'app-second-dialog',
  template: `
    <div style="padding: 24px; background: white; border-radius: 8px; max-width: 350px;">
      <h2>Second Dialog</h2>
      <p>This is stacked on top of the first dialog.</p>
      <p>Try pressing Escape — only this dialog should close.</p>
      <div style="display: flex; gap: 8px; margin-top: 16px;">
        <input placeholder="Test focus trapping" />
        <button (click)="close()">Close</button>
      </div>
    </div>
  `,
})
export class SecondDialog {
  constructor(private readonly dialogRef: DialogRef) {}

  close(): void {
    this.dialogRef.close('second-result');
  }
}
