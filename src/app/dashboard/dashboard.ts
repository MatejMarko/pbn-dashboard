import { Component, inject, signal } from '@angular/core';
import {
  AtMostPipe,
  DsButton, DsDialogCdkService,
  DsError,
  DsFormField,
  DsHint,
  DsHintRight,
  DsIconButton,
  DsInput,
  DsLabel, GhostButton, ScreenSize, ScreenSizeService,
  Breadcrumb, Breadcrumbs,
  SvgComponent,
  OTP_TABLE,
} from '@design-system';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { form, required, FormField } from '@angular/forms/signals';
import { FirstDialog } from '../first-dialog';

interface Card {
  id: number;
  name: string;
  number: string;
  expiry: string;
  status: 'Active' | 'Blocked';
  monthlyLimit: string | null;
  usedLimit: string | null;
  availableLimit: string;
}

@Component({
  selector: 'app-dashboard',
  imports: [
    DsButton,
    DsError,
    DsFormField,
    DsInput,
    DsLabel,
    DsLabel,
    FormsModule,
    AtMostPipe,
    Breadcrumbs,
    DsHint,
    DsHintRight,
    DsIconButton,
    GhostButton,
    SvgComponent,
    ReactiveFormsModule,
    FormField,
    OTP_TABLE,
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {
  protected screenSizeService = inject(ScreenSizeService);
  protected ss: ScreenSize = 'MD';

  // Reactive form test
  nameControl = new FormControl('', [Validators.required, Validators.minLength(3)]);
  nameControl2 = new FormControl('', [Validators.required, Validators.minLength(4)]);
  nameControl3 = new FormControl('', [Validators.required, Validators.minLength(5)]);
  nameControl4 = new FormControl('', [Validators.minLength(3)]);
  nameControl5 = new FormControl('disabled', [Validators.required, Validators.minLength(2)]);
  nameControl6 = new FormControl('readonly', [Validators.required, Validators.minLength(2)]);

  protected breadcrumbs: Breadcrumb[] = [
    {
      label: 'Accounts',
      path: ['/', 'accounts'],
    },
    {
      label: 'Account details',
      path: ['/', 'accounts', 'details'],
    },
  ];

  protected readonly signalFormTest = signal<{test: string}>({
    test: '',
  });
  protected readonly signalForm = form(this.signalFormTest, (schemaPath) => {
    required(schemaPath.test, {message: 'Email is required'});
    // disabled(schemaPath.test);
  });

  protected selectedCards = signal(new Set<unknown>());

  page = signal(0);
  pageChange(pageNumber: number) {
    this.page.set(pageNumber);
  }

  protected debitCards: Card[] = Array.from({ length: 12 }, (_, i) => ({
    id: i + 1,
    name: 'Maja Novak',
    number: '1234 12** **** 1234',
    expiry: '12/2028',
    status: i === 0 ? 'Blocked' : 'Active',
    monthlyLimit: null,
    usedLimit: null,
    availableLimit: '/',
  }));

  protected creditCards: Card[] = Array.from({ length: 9 }, (_, i) => ({
    id: 100 + i,
    name: 'Maja Novak',
    number: '1234 12** **** 1234',
    expiry: '12/2028',
    status: i === 1 ? 'Blocked' : 'Active',
    monthlyLimit: '5.000,00 EUR',
    usedLimit: '2.000,00 EUR',
    availableLimit: '3.000,00 EUR',
  }));

  protected prepaidCards: Card[] = [
    { id: 200, name: 'Maja Novak', number: '1234 12** **** 1234', expiry: '12/2028', status: 'Active', monthlyLimit: null, usedLimit: null, availableLimit: '4.210,00 EUR' },
    { id: 201, name: 'Maja Novak', number: '1234 12** **** 1234', expiry: '12/2028', status: 'Blocked', monthlyLimit: null, usedLimit: null, availableLimit: '500,00 EUR' },
  ];

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
