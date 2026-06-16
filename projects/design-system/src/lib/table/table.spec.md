# Table Component

A composable, CSS Grid-based data table with built-in selection, sections, and pagination.

## Import

```ts
import { OTP_TABLE } from '@design-system';
```

`OTP_TABLE` is a const array containing all table-related components and directives. Add it to your component's `imports`.

## Components & Directives

### `<otp-table>`

Root container. Defines the column layout via CSS grid.

| Input        | Type           | Default      | Description                                     |
| ------------ | -------------- | ------------ | ----------------------------------------------- |
| `columns`    | `string`       | **required** | CSS `grid-template-columns` value (e.g. `"2fr 1fr 1fr"`) |
| `selectable` | `boolean`      | `false`      | Enables row selection checkboxes                |
| `selected`   | `Set<unknown>` | `new Set()`  | Two-way binding for selected row values         |

When `selectable` is `true`, a checkbox column is automatically prepended.

### `<otp-table-header>`

Renders the header row. When the table is selectable, a "select all" checkbox appears automatically.

### `otp-table-header-cell`

Directive for each column header. Sets `role="columnheader"`.

### `<otp-table-row>`

A single data row.

| Input   | Type      | Default | Description                                 |
| ------- | --------- | ------- | ------------------------------------------- |
| `value` | `unknown` | —       | Unique identifier for the row. **Required when `selectable` is enabled.** |

When the table is selectable, a checkbox is rendered automatically in the first cell.

### `otp-table-cell`

Directive for each data cell. Sets `role="cell"`.

### `<otp-table-section>`

Optional component for tables that need to be split into sections. Groups rows under a collapsible header with optional "Show more / Show less" overflow.

| Input         | Type     | Default      | Description                                                  |
| ------------- | -------- | ------------ | ------------------------------------------------------------ |
| `label`       | `string` | **required** | Section header text                                          |
| `expandLimit` | `number` | `4`          | Max visible rows before "Show more" appears. `0` = no limit |

### `<otp-table-footer>`

Full-width container for footer actions and/or pagination. **Always include a footer** — even if empty — to get the rounded bottom border styling.

### `otp-table-footer-actions`

Directive for placing action buttons inside the footer.

### `<otp-table-pagination>`

Page navigation control.

| Input      | Type     | Default      | Description            |
| ---------- | -------- | ------------ | ---------------------- |
| `page`     | `number` | **required** | Current page (0-based) |
| `pageSize` | `number` | **required** | Items per page         |
| `total`    | `number` | **required** | Total item count       |

| Output       | Type     | Description               |
| ------------ | -------- | ------------------------- |
| `pageChange` | `number` | Emits the new page number |

## Usage Examples

### Basic Table

```html
<otp-table columns="2fr 1fr 1fr">
  <otp-table-header>
    <otp-table-header-cell>Name</otp-table-header-cell>
    <otp-table-header-cell>Status</otp-table-header-cell>
    <otp-table-header-cell>Amount</otp-table-header-cell>
  </otp-table-header>

  @for (item of items; track item.id) {
    <otp-table-row>
      <otp-table-cell>{{ item.name }}</otp-table-cell>
      <otp-table-cell>{{ item.status }}</otp-table-cell>
      <otp-table-cell>{{ item.amount }}</otp-table-cell>
    </otp-table-row>
  }

  <otp-table-footer></otp-table-footer>
</otp-table>
```

### Basic table with row selection enabled

```ts
selectedItems = signal(new Set<unknown>());
```

```html
<otp-table columns="2fr 1fr" [selectable]="true" [(selected)]="selectedItems">
  <otp-table-header>
    <otp-table-header-cell>Name</otp-table-header-cell>
    <otp-table-header-cell>Status</otp-table-header-cell>
  </otp-table-header>

  @for (item of items; track item.id) {
    <otp-table-row [value]="item.id">
      <otp-table-cell>{{ item.name }}</otp-table-cell>
      <otp-table-cell>{{ item.status }}</otp-table-cell>
    </otp-table-row>
  }

  <otp-table-footer></otp-table-footer>
</otp-table>
```

The header checkbox toggles all rows and shows an indeterminate state when only some are selected.

### Table with sections

```html
<otp-table columns="2fr 1fr 1fr">
  <otp-table-header>
    <otp-table-header-cell>Card</otp-table-header-cell>
    <otp-table-header-cell>Status</otp-table-header-cell>
    <otp-table-header-cell>Balance</otp-table-header-cell>
  </otp-table-header>

  <otp-table-section label="Debit cards">
    @for (card of debitCards; track card.id) {
      <otp-table-row [value]="card.id">
        <otp-table-cell>{{ card.name }}</otp-table-cell>
        <otp-table-cell>{{ card.status }}</otp-table-cell>
        <otp-table-cell>{{ card.balance }}</otp-table-cell>
      </otp-table-row>
    }
  </otp-table-section>

  <otp-table-section label="Credit cards" [expandLimit]="0">
    @for (card of creditCards; track card.id) {
      <otp-table-row [value]="card.id">
        <otp-table-cell>{{ card.name }}</otp-table-cell>
        <otp-table-cell>{{ card.status }}</otp-table-cell>
        <otp-table-cell>{{ card.balance }}</otp-table-cell>
      </otp-table-row>
    }
  </otp-table-section>

  <otp-table-footer></otp-table-footer>
</otp-table>
```

### Pagination

```ts
page = signal(0);

onPageChange(newPage: number) {
  this.page.set(newPage);
}
```

```html
<otp-table columns="2fr 1fr 1fr">
  <otp-table-header>
    <otp-table-header-cell>Name</otp-table-header-cell>
    <otp-table-header-cell>Status</otp-table-header-cell>
    <otp-table-header-cell>Amount</otp-table-header-cell>
  </otp-table-header>

  @for (item of paginatedItems(); track item.id) {
    <otp-table-row>
      <otp-table-cell>{{ item.name }}</otp-table-cell>
      <otp-table-cell>{{ item.status }}</otp-table-cell>
      <otp-table-cell>{{ item.amount }}</otp-table-cell>
    </otp-table-row>
  }

  <otp-table-footer>
    <otp-table-pagination
      [page]="page()"
      [pageSize]="10"
      [total]="items.length"
      (pageChange)="onPageChange($event)">
    </otp-table-pagination>
  </otp-table-footer>
</otp-table>
```

### Footer Actions

```html
<otp-table-footer>
  <otp-table-footer-actions>
    <button otp-button>Export all</button>
    <button otp-button>Delete selected</button>
  </otp-table-footer-actions>

  <otp-table-pagination
    [page]="page()"
    [pageSize]="10"
    [total]="total"
    (pageChange)="onPageChange($event)">
  </otp-table-pagination>
</otp-table-footer>
```

### Sections with selection and footer actions

```ts
selectedCards = signal(new Set<unknown>());
```

```html
<otp-table columns="2fr 1fr 1fr 1fr" [selectable]="true" [(selected)]="selectedCards">
  <otp-table-header>
    <otp-table-header-cell>Card</otp-table-header-cell>
    <otp-table-header-cell>Status</otp-table-header-cell>
    <otp-table-header-cell>Balance</otp-table-header-cell>
    <otp-table-header-cell>Expires</otp-table-header-cell>
  </otp-table-header>

  <otp-table-section label="Debit cards">
    @for (card of debitCards; track card.id) {
      <otp-table-row [value]="card.id">
        <otp-table-cell>{{ card.name }}</otp-table-cell>
        <otp-table-cell>{{ card.status }}</otp-table-cell>
        <otp-table-cell>{{ card.balance }}</otp-table-cell>
        <otp-table-cell>{{ card.expires }}</otp-table-cell>
      </otp-table-row>
    }
  </otp-table-section>

  <otp-table-section label="Credit cards">
    @for (card of creditCards; track card.id) {
      <otp-table-row [value]="card.id">
        <otp-table-cell>{{ card.name }}</otp-table-cell>
        <otp-table-cell>{{ card.status }}</otp-table-cell>
        <otp-table-cell>{{ card.balance }}</otp-table-cell>
        <otp-table-cell>{{ card.expires }}</otp-table-cell>
      </otp-table-row>
    }
  </otp-table-section>

  <otp-table-footer>
    <otp-table-footer-actions>
      <button otp-button>Export all</button>
    </otp-table-footer-actions>
  </otp-table-footer>
</otp-table>
```
