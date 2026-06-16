import { Component, computed, inject, signal } from '@angular/core';
import {
  AtMostPipe,
  DsButton, DsDialogCdkService,
  ErrorDirective,
  FormFieldComponent,
  HintDirective,
  HintRightDirective,
  DsIconButton,
  InputComponent,
  LabelDirective, GhostButton, ScreenSize, ScreenSizeService,
  Breadcrumb, Breadcrumbs,
  SvgComponent,
  OTP_TABLE,
  OTP_DATEPICKER,
  ChipFilterComponent,
  ChipOption,
  DS_EXPANDABLE_SECTION,
} from '@design-system';
import { FormBuilder, FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { form, required, FormField } from '@angular/forms/signals';
import { defer, map, of } from 'rxjs';
import { FirstDialog } from '../first-dialog';
import { SvgNames } from '@design-system/lib/svg/svg-names.enum';
import {
  DS_FORM_FIELD
} from '../../../.claude/worktrees/trusting-chatterjee-be2f38/projects/design-system/src/lib/ds-form-field';

type DirectionEnum = 'OUTGOING' | 'INCOMING';
export interface DateRangePickerData {
  dateFrom?: Date;
  dateTo?: Date;
}
export interface AmountRange {
  from?: number | undefined;
  to?: number | undefined;
}
interface TransactionFiltersFormFields {
  searchString: FormControl<string | null>;
  dateRange: FormControl<DateRangePickerData | null>;
  amountRange: FormControl<AmountRange | null>;
  type: FormControl<DirectionEnum | null>;
}


interface DateRange {
  from: Date;
  to: Date;
}

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
    ErrorDirective,
    FormFieldComponent,
    InputComponent,
    LabelDirective,
    LabelDirective,
    FormsModule,
    AtMostPipe,
    Breadcrumbs,
    HintDirective,
    HintRightDirective,
    DsIconButton,
    GhostButton,
    SvgComponent,
    ReactiveFormsModule,
    FormField,
    OTP_TABLE,
    OTP_DATEPICKER,
    ChipFilterComponent,
    DS_EXPANDABLE_SECTION,
    DS_FORM_FIELD,
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {
  private dialogService = inject(DsDialogCdkService);
  private formBuilder = inject(FormBuilder);

  protected readonly SvgNames = SvgNames;

  protected filterForm = this.formBuilder.group<TransactionFiltersFormFields>({
    searchString: new FormControl(null),
    dateRange: new FormControl({ dateFrom: undefined, dateTo: undefined }),
    amountRange: new FormControl({ from: undefined, to: undefined }),
    type: new FormControl(null),
  });

  // todo: add unique IDS with som function
  protected readonly dateRangeFilterOptions: ChipOption<DateRangePickerData>[] = [
    {
      id: crypto.randomUUID(),
      label: `Last 7 days`,
      value: {
        dateFrom: new Date(),
        dateTo: new Date(),
      },
    },
    {
      id: crypto.randomUUID(),
      label: `Last 30 days`,
      value: {
        dateFrom: new Date(),
        dateTo: new Date(),
      },
    },
    {
      id: crypto.randomUUID(),
      label: `Last 90 days`,
      value: {
        dateFrom: new Date(),
        dateTo: new Date(),
      },
    },
    {
      id: crypto.randomUUID(),
      label: `Date range`,
      value: {
        dateFrom: new Date(),
        dateTo: new Date(),
      },
      selectHandler: (currentRange: ChipOption<DateRangePickerData>) => {
        return this.dialogService
          .open<unknown, unknown, DateRangePickerData>(SvgComponent, {
            dialogVariant: 'simple',
            data: currentRange.value,
          })
          .closed.pipe(
            map((data: DateRangePickerData | undefined) => {
              if (!data) {
                return null;
              }
              return {
                label: data.dateFrom + ' - ' + data.dateTo, // todo: use pipe
                value: data,
              };
            }),
          );
      },
    },
  ];
  protected readonly amountRangeFilterOptions: ChipOption<AmountRange>[] = [
    {
      id: crypto.randomUUID(),
      label: `All amounts`,
      value: {
        from: undefined,
        to: undefined,
      },
      isDefault: true,
    },
    {
      id: crypto.randomUUID(),
      label: `0 - 1.000`,
      value: {
        from: 0,
        to: 1000,
      },
    },
    {
      id: crypto.randomUUID(),
      label: `1.000 - 10.000`,
      value: {
        from: 1000,
        to: 10000,
      },
    },
    {
      id: crypto.randomUUID(),
      label: `10.000+`,
      value: {
        from: 1000,
        to: undefined,
      },
    },
    {
      id: crypto.randomUUID(),
      label: `Amount range`,
      value: {
        from: undefined,
        to: undefined,
      },
      selectHandler: (currentRange: ChipOption<AmountRange>) => {
        return this.dialogService
          .open<unknown, unknown, AmountRange>(SvgComponent, {
            dialogVariant: 'simple',
            data: currentRange.value,
          })
          .closed.pipe(
            // check what this dialog returns
            map((data: AmountRange | undefined) => {
              if (!data) {
                return null;
              }
              return {
                label: data.from + ' - ' + data.to,
                value: data,
              };
            }),
          );
      },
    },
  ];
  protected readonly typeFilterOptions: ChipOption<DirectionEnum | null>[] = [
    {
      id: crypto.randomUUID(),
      label: 'All types',
      value: null,
      isDefault: true,
    },
    {
      id: crypto.randomUUID(),
      label: 'Outflow',
      value: 'OUTGOING',
    },
    {
      id: crypto.randomUUID(),
      label: 'Inflow',
      value: 'INCOMING',
    },
  ];

  readonly defaultDateRange = [this.dateRangeFilterOptions[1]];
  readonly defaultAmountRange: ChipOption<AmountRange>[] = [this.amountRangeFilterOptions[0]];
  readonly defaultType: ChipOption<DirectionEnum | null>[] = [this.typeFilterOptions[0]];

  protected searchQuery = signal('');
  protected dateRangeSelected = signal<ChipOption<DateRangePickerData>[]>(this.defaultDateRange);
  protected amountRangeSelected = signal<ChipOption<AmountRange>[]>(this.defaultAmountRange);
  protected typeSelected = signal<ChipOption<DirectionEnum | null>[]>(this.defaultType);

  protected onReset(): void {
    this.searchQuery.set('');
    this.dateRangeSelected.set(this.defaultDateRange);
    this.amountRangeSelected.set(this.defaultAmountRange);
    this.typeSelected.set(this.defaultType);
  }

  protected hasActiveFilters = computed(() =>
    this.searchQuery().trim().length > 0 ||
    !this.isSameSelection<DateRangePickerData>(this.dateRangeSelected(), this.defaultDateRange) ||
    !this.isSameSelection<AmountRange>(this.amountRangeSelected(), this.defaultAmountRange) ||
    !this.isSameSelection<DirectionEnum | null>(this.typeSelected(), this.defaultType)
  );

  private isSameSelection<T>(a: ChipOption<T>[], b: ChipOption<T>[]): boolean {
    if (a.length !== b.length) {
      return false;
    }
    const bIds = new Set(b.map(o => o.id));
    return a.every(o => bIds.has(o.id));
  }














  protected screenSizeService = inject(ScreenSizeService);
  protected ss: ScreenSize = 'MD';

  // Reactive form test
  nameControl = new FormControl('', [Validators.required, Validators.minLength(3)]);
  nameControl2 = new FormControl('', [Validators.required, Validators.minLength(4)]);
  nameControl3 = new FormControl('', [Validators.required, Validators.minLength(5)]);
  nameControl4 = new FormControl('', [Validators.minLength(3)]);
  nameControl5 = new FormControl('disabled', [Validators.required, Validators.minLength(2)]);
  nameControl6 = new FormControl('readonly', [Validators.required, Validators.minLength(2)]);

  // Datepicker test
  dateControl = new FormControl<Date | null>(null);
  dateControl2 = new FormControl<Date | null>(null);
  minDate = new Date(2025, 0, 1);
  maxDate = new Date(2027, 11, 31);

  onDateSelected(date: Date): void {
    console.log('Date selected:', date);
  }

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

  // Chip filter examples
  protected readonly timeOptions: ChipOption<string | DateRange | null>[] = [
    { id: 'last-7d', label: 'Last 7 days', value: '7d' },
    { id: 'last-30d', label: 'Last 30 days', value: '30d' },
    { id: 'last-90d', label: 'Last 90 days', value: '90d' },
    {
      id: 'date-range',
      label: 'Date range',
      value: null,
      // In a real app the dialog returns DateRange — label is its string representation.
      selectHandler: (current) =>
        defer(() => {
          const label = window.prompt('Enter date range (e.g. 1 Jan – 30 Jan):', current.label !== 'Date range' ? current.label : '');
          return of(label !== null ? { label, value: { from: new Date(), to: new Date() } } : null);
        }),
    },
  ];
  protected readonly selectedTime = signal<ChipOption<string | DateRange | null>[]>([
    this.timeOptions.find((o) => o.id === 'last-30d')!,
  ]);

  protected readonly amountOptions: ChipOption<AmountRange | null>[] = [
    { id: 'all', label: 'All amounts', value: null, isDefault: true },
    { id: '0-1000', label: '0 – 1.000', value: { from: 0, to: 1000 } },
    { id: '1000-10000', label: '1.000 – 10.000', value: { from: 1000, to: 10000 } },
    { id: '10000+', label: '10.000+', value: { from: 10000, to: undefined } },
    {
      id: 'amount-range',
      label: 'Amount range',
      value: null,
      // In a real app, open a dialog that returns AmountRange.
      // The handler stores the result in customAmountRange and returns a display string.
      selectHandler: (current) =>
        defer(() => {
          const label = window.prompt('Enter amount range (e.g. 500 – 2.000):', current.label !== 'Amount range' ? current.label : '');
          // In a real app, the dialog returns AmountRange and you parse from/to here.
          return of(label !== null ? { label, value: null as AmountRange | null } : null);
        }),
    },
  ];
  protected readonly selectedAmount = signal<ChipOption<AmountRange | null>[]>([]);

  protected readonly typeOptions: ChipOption<string>[] = [
    { id: 'all', label: 'All types', value: 'all', isDefault: true },
    { id: 'outflow', label: 'Outflow', value: 'outflow' },
    { id: 'inflow', label: 'Inflow', value: 'inflow' },
  ];
  protected readonly selectedType = signal<ChipOption<string>[]>([]);

  protected readonly currencyOptions: ChipOption<string>[] = [
    { id: 'eur', label: 'EUR', value: 'EUR' },
    { id: 'usd', label: 'USD', value: 'USD' },
    { id: 'chf', label: 'CHF', value: 'CHF' },
    { id: 'aud', label: 'AUD', value: 'AUD' },
    { id: 'gbp', label: 'GBP', value: 'GBP' },
    { id: 'huf', label: 'HUF', value: 'HUF' },
    { id: 'huf2', label: 'HUF2', value: 'HUF2' },
    { id: 'huf3', label: 'HUF3', value: 'HUF3' },
    { id: 'huf4', label: 'HUF4', value: 'HUF4' },
    { id: 'huf5', label: 'HUF5', value: 'HUF5' },
    { id: 'huf6', label: 'HUF6', value: 'HUF6' },
    { id: 'huf7', label: 'HUF7', value: 'HUF7' },
    { id: 'huf8', label: 'HUF8', value: 'HUF8' },
  ];
  protected readonly selectedCurrencies = signal<ChipOption<string>[]>([]);

  constructor() {
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
