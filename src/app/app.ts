import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  DsButton,
  DsDialogCdkService,
  DsError,
  DsFormField,
  DsHint,
  DsHintRight,
  DsInput,
  DsLabel,
  DsIconButton,
  GhostButton, ScreenSizeService, ScreenSize, AtLeastPipe, AtMostPipe,
} from '@design-system';
import { FirstDialog } from './first-dialog';
import { form, FormField, required } from '@angular/forms/signals';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ReactiveFormsModule, FormField, DsButton, DsIconButton, DsFormField, DsInput, DsLabel, DsError, DsHint, DsHintRight, DsIconButton, AtMostPipe, GhostButton, AtLeastPipe],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('pbn-dashboard');

  protected screenSizeService = inject(ScreenSizeService);
  protected ss: ScreenSize = 'MD';

  // Reactive form test
  nameControl = new FormControl('', [Validators.required, Validators.minLength(3)]);
  nameControl2 = new FormControl('', [Validators.required, Validators.minLength(4)]);
  nameControl3 = new FormControl('', [Validators.required, Validators.minLength(5)]);
  nameControl4 = new FormControl('', [Validators.minLength(3)]);
  nameControl5 = new FormControl('disabled', [Validators.required, Validators.minLength(2)]);
  nameControl6 = new FormControl('readonly', [Validators.required, Validators.minLength(2)]);


  protected readonly signalFormTest = signal<{test: string}>({
    test: '',
  });
  protected readonly signalForm = form(this.signalFormTest, (schemaPath) => {
    required(schemaPath.test, {message: 'Email is required'});
    // disabled(schemaPath.test);
  });

  constructor(private readonly dialogService: DsDialogCdkService) {
    this.nameControl5.disable();

    this.nameControl4.valueChanges.subscribe(() => this.nameControl4.addValidators(Validators.required));

  }

  openDialog(): void {
    const ref = this.dialogService.open(FirstDialog);
    ref.closed.subscribe(result => {
      console.log('First dialog closed with:', result);
    });
  }
}
