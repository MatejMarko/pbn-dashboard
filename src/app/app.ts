import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Button, DsButton, DsDialogCdkService, DsFormField, DsInput } from '@design-system';
import { FirstDialog } from './first-dialog';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Button, DsButton, DsFormField, DsInput],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('pbn-dashboard');

  constructor(private readonly dialogService: DsDialogCdkService) {}

  openDialog(): void {
    const ref = this.dialogService.open(FirstDialog);
    ref.closed.subscribe(result => {
      console.log('First dialog closed with:', result);
    });
  }
}
