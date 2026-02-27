import { Component, inject, input } from '@angular/core';
import { DialogRef } from '@angular/cdk/dialog';
// todo: remove @design-system references in library
import { DsIconButton } from '../../lib/ds-button';

@Component({
  selector: 'lib-dialog-component',
  imports: [
    DsIconButton
  ],
  templateUrl: './dialog-component.html',
  styleUrl: './dialog-component.scss',
})
// todo: rename to something like InformativeDialogComponent (or Basic/SmallDialogComponent)
//  as we also have another dialog version, much wider one that's used to show product details
export class DialogComponent {
  private readonly dialogRef = inject(DialogRef);

  public hasCloseIcon = input<boolean>(false);

  protected closeDialog() {
    this.dialogRef.close();
  }
}
