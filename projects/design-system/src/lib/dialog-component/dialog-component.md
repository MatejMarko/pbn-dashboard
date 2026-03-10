# DialogComponent

A structured dialog layout component used inside dialogs opened via `DsDialogCdkService`. Provides content projection slots for title, description, actions, and optional custom content.

> **Note:** This component is the dialog _body_ layout, not the dialog opener. Use `DsDialogCdkService` to open dialogs.

## Usage

### 1. Create a dialog content component

```typescript
@Component({
  selector: 'pbn-my-dialog',
  imports: [OTP_SIMPLE_DIALOG, ButtonComponent],
  template: `
    <otp-simple-dialog [hasCloseIcon]="true">
      <otp-icon-background type="success" icon="OTP-icon-16x16-delete"></otp-icon-background>
      <otp-dialog-title>This is a title</otp-dialog-title>
      <otp-dialog-description>This is a description</otp-dialog-description>
      <!-- possible custom content -->
      <ng-container otpDialogContent>
        <div style="height: 40px; width: 100%; background: red; border-radius: 16px"></div>
        <div style="height: 60px; width: 100%; background: blue; border-radius: 16px"></div>
        <div style="height: 80px; width: 100%; background: green; border-radius: 16px"></div>
        <div style="height: 60px; width: 100%; background: yellow; border-radius: 16px"></div>
      </ng-container>
      <ng-container otpDialogActions>
        <button otp-button (click)="confirm()">Confirm</button>
        <button otp-button (click)="close()" variant="secondary">Cancel</button>
      </ng-container>
    </otp-simple-dialog>
  `,
})
export class MyDialogComponent {
  private readonly dialogRef = inject(DialogRef);

  confirm(): void {
    this.dialogRef.close(true);
  }
  cancel(): void {
    this.dialogRef.close(false);
  }
}
```

### 2. Open the dialog

```typescript
private dialogService = inject(DialogService);

openDialog(): void {
  const ref = this.dialogService.open(MyDialogComponent, {
    dialogVariant: 'simple',  // 'simple' (30rem) | 'complex' (37.5rem)
    data: { /* optional data */ },
    // optional other props from DialogConfigurations
  });

  ref.closed.subscribe((result) => {
    console.log('Dialog closed with:', result);
  });
}
```

## Inputs

| Input          | Type      | Default | Description                          |
| -------------- | --------- | ------- | ------------------------------------ |
| `hasCloseIcon` | `boolean` | `false` | Shows an X button in the top corner. |

## Content projection slots

| Slot                    | Selector                  | Description                                       |
| ----------------------- | ------------------------- | ------------------------------------------------- |
| Icon                    | `otp-icon-background`     | Optional icon displayed above the title.           |
| Title                   | `otp-dialog-title`             | Dialog heading text.                               |
| Description             | `otp-dialog-description`     | Body text below the title.                         |
| Custom content          | `[otpDialogContent]`   | Arbitrary content between description and actions. |
| Actions                 | `[otpDialogActions]`         | Action buttons at the bottom of the dialog.        |

## DialogService config

The service applies sensible defaults that can be overridden per call:

| Option           | Default              | Description                                                        |
| ---------------- | -------------------- | ------------------------------------------------------------------ |
| `hasBackdrop`    | `true`               | Show a backdrop behind the dialog.                                 |
| `backdropClass`  | `otp-dialog-backdrop` | CSS class applied to the backdrop.                                |
| `width`          | `30rem`              | Dialog width. Auto-set by `dialogVariant` when not provided.       |
| `maxWidth`       | `95vw`               | Maximum width.                                                     |
| `disableClose`   | `false`              | Prevent closing via backdrop click or Escape key.                  |
| `autoFocus`      | `first-tabbable`     | Where to focus when the dialog opens.                              |
| `restoreFocus`   | `true`               | Restore focus to the previously focused element on close.          |
| `dialogVariant`  | `simple`             | `'simple'` (30rem) or `'complex'` (37.5rem) preset widths.        |
| `data`           | —                    | Data passed to the dialog, injectable via `DIALOG_DATA`.           |
