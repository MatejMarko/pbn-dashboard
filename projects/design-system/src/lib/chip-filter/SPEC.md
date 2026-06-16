# ChipFilterComponent

A generic, accessible filter chip that opens a dropdown of selectable options. Supports single and multi select, optional icons per option, and custom option handlers for opening dialogs (date range, amount range, etc.).

## Selector

```html
<otp-chip-filter />
```

## API

### Inputs

| Input | Type | Required | Default | Description |
|---|---|---|---|---|
| `label` | `string` | yes | — | Default chip label shown when nothing is selected |
| `options` | `ChipOption<T>[]` | yes | — | List of available options |
| `multiselect` | `boolean` | no | `false` | Allows multiple options to be selected simultaneously |

### Model (two-way binding)

| Model | Type | Default | Description |
|---|---|---|---|
| `value` | `ChipOption<T>[]` | `[]` | Currently selected options |

## ChipOption interface

```typescript
interface ChipOption<T = unknown> {
  id: string;
  label: string;
  value: T;
  icon?: SvgNames;
  isDefault?: boolean;
  selectHandler?: (current: ChipOption<T>) => Observable<{ label: string; value: T } | null>;
}
```

| Field | Description |
|---|---|
| `id` | Unique identifier used for tracking and comparison |
| `label` | Display text shown in the dropdown and chip when selected |
| `value` | Data payload passed to the consumer (e.g. API parameter, date range, amount range) |
| `icon` | Optional icon displayed to the right of the label in the dropdown |
| `isDefault` | Marks the option as a neutral/no-filter state. The chip looks inactive when only default options are selected, but the option still shows as highlighted in the dropdown |
| `selectHandler` | If provided, clicking the option opens a consumer-controlled flow (e.g. a dialog) instead of the default toggle. Receives the currently stored option for pre-population. Returns `{ label, value }` to update the chip, or `null` to cancel |

## Behaviour

### Chip trigger

- Shows `label` when nothing is selected, or when only `isDefault` options are selected (grey border, grey text)
- Shows selected option label(s) when a non-default option is active (green border, green text)
- For multi select: joins all non-default selected labels with `, `
- Toggles the dropdown on click, Enter, or Space

### Dropdown

- Positioned below the trigger via CDK overlay; flips above if space is insufficient
- **Single select**: closes when an option is clicked; re-clicking the already-selected option is a no-op
- **Multi select**: stays open; closes on backdrop click or Escape
- **Reset button**: appears in multi select when at least one option is selected; clears all selections

### Custom options (`selectHandler`)

Options with a `selectHandler` open a consumer-controlled flow instead of toggling. The handler receives the currently stored version of the option so the consumer can pre-populate their dialog with the previous selection. The handler returns `{ label, value }` — `label` is shown in the chip, `value` updates the stored option's data payload. Returning `null` cancels and leaves the selection unchanged.

Custom options are never highlighted as selected in the dropdown, but they do contribute to the chip's active state.

## Usage examples

### Single select with fixed options

```typescript
typeOptions: ChipOption<string>[] = [
  { id: 'all',     label: 'All types', value: 'all',     isDefault: true },
  { id: 'outflow', label: 'Outflow',   value: 'outflow' },
  { id: 'inflow',  label: 'Inflow',    value: 'inflow'  },
];

selectedType = signal<ChipOption<string>[]>([]);
```

```html
<otp-chip-filter
  label="All types"
  [options]="typeOptions"
  [(value)]="selectedType"
/>
```

### Single select with a custom dialog option

When some options have a fixed value and one opens a dialog, widen `T` to a union so the dialog result can be stored in `value` alongside fixed values:

```typescript
interface DateRange { from: Date; to: Date; }

timeOptions: ChipOption<string | DateRange | null>[] = [
  { id: 'last-7d',  label: 'Last 7 days',  value: '7d' },
  { id: 'last-30d', label: 'Last 30 days', value: '30d' },
  { id: 'last-90d', label: 'Last 90 days', value: '90d' },
  {
    id: 'date-range',
    label: 'Date range',
    value: null,
    selectHandler: (current) =>
      this.dialog.open(DateRangeDialog, { data: current.value })
        .afterClosed()
        .pipe(
          map((result: DateRange | null) =>
            result ? { label: formatDateRange(result), value: result } : null
          )
        ),
  },
];

selectedTime = signal<ChipOption<string | DateRange | null>[]>([
  this.timeOptions.find(o => o.id === 'last-30d')!,
]);
```

```html
<otp-chip-filter
  label="Time"
  [options]="timeOptions"
  [(value)]="selectedTime"
/>
```

Reading the value:

```typescript
const val = this.selectedTime()[0]?.value;
if (typeof val === 'string')          { /* fixed period: '7d', '30d', '90d' */ }
else if (val && typeof val === 'object') { /* DateRange: val.from, val.to */ }
```

### Single select with an amount range dialog

```typescript
interface AmountRange { from: number | null; to: number | null; }

amountOptions: ChipOption<AmountRange | null>[] = [
  { id: 'all',         label: 'All amounts',      value: null,                    isDefault: true },
  { id: '0-1000',      label: '0 – 1.000',        value: { from: 0,     to: 1000  } },
  { id: '1000-10000',  label: '1.000 – 10.000',   value: { from: 1000,  to: 10000 } },
  { id: '10000+',      label: '10.000+',           value: { from: 10000, to: null  } },
  {
    id: 'amount-range',
    label: 'Amount range',
    value: null,
    selectHandler: (current) =>
      this.dialog.open(AmountRangeDialog, { data: current.value })
        .afterClosed()
        .pipe(
          map((result: AmountRange | null) =>
            result ? { label: `${result.from} – ${result.to}`, value: result } : null
          )
        ),
  },
];

selectedAmount = signal<ChipOption<AmountRange | null>[]>([]);
```

Consumer reads `selectedAmount()[0]?.value` to get `AmountRange | null` for all cases including the custom dialog result — no separate signal needed.

### Multi select with icons

```typescript
currencyOptions: ChipOption<string>[] = [
  { id: 'eur', label: 'EUR', value: 'EUR', icon: SvgNames.EUR_FLAG },
  { id: 'usd', label: 'USD', value: 'USD', icon: SvgNames.USD_FLAG },
];

selectedCurrencies = signal<ChipOption<string>[]>([]);
```

```html
<otp-chip-filter
  label="All currencies"
  [options]="currencyOptions"
  [multiselect]="true"
  [(value)]="selectedCurrencies"
/>
```

### Default selected value

Reference `options` directly to avoid duplicating the object:

```typescript
selectedTime = signal<ChipOption<string | DateRange | null>[]>([
  this.timeOptions.find(o => o.id === 'last-30d')!,
]);
```

### Syncing with a FormControl

```typescript
constructor() {
  effect(() => this.periodControl.setValue(this.selectedTime()[0]?.value ?? null));
}
```

Use `{ emitEvent: false }` if you have `valueChanges` subscribers that should not react to programmatic updates:

```typescript
effect(() => this.periodControl.setValue(this.selectedTime()[0]?.value ?? null, { emitEvent: false }));
```

### Without a signal (output binding)

When the parent does not use a signal, bind to `(valueChange)` directly:

```html
<otp-chip-filter
  label="Amount"
  [options]="amountOptions"
  [value]="selectedAmount"
  (valueChange)="onAmountChange($event)"
/>
```

```typescript
protected selectedAmount: ChipOption<AmountRange>[] = [];

protected onAmountChange(value: ChipOption<AmountRange>[]): void {
  this.selectedAmount = value;
  const range = value[0]?.value; // use range.from / range.to
}
```

## Accessibility

- Trigger is a `<button>` with `aria-haspopup="listbox"` and `aria-expanded`
- Dropdown has `role="listbox"` with `aria-label` from the `label` input and `aria-multiselectable="true"` when in multi select mode
- All options use `role="option"` with `aria-selected`
- Keyboard: Enter/Space to toggle trigger and options, Escape to close
