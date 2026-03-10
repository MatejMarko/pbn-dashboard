import {
  Component,
  computed,
  contentChildren,
  input,
  model,
  ViewEncapsulation,
} from '@angular/core';
import { TableRowComponent } from '../table-row/table-row.component';

@Component({
  selector: 'otp-table',
  template: '<ng-content></ng-content>',
  styleUrl: '../table.styles.scss',
  encapsulation: ViewEncapsulation.None,
  host: {
    'role': 'table',
    '[style.grid-template-columns]': 'resolvedColumns()',
    '[class.table]': 'true',
    '[class.table-selectable]': 'selectable()',
  },
})
export class TableComponent {
  /** CSS grid-template-columns value for data columns (excludes checkbox column). */
  readonly columns = input.required<string>();

  /** Whether rows show checkboxes for selection. */
  readonly selectable = input(false);

  /** Two-way binding for the set of selected row values. */
  readonly selected = model<Set<unknown>>(new Set());

  /** All TableRowComponent children (across sections and direct). */
  readonly rows = contentChildren(TableRowComponent, { descendants: true });

  /** Final grid-template-columns including optional checkbox column. */
  protected readonly resolvedColumns = computed(() => {
    const base = this.columns();
    return this.selectable() ? `2.5rem ${base}` : base;
  });

  /** Whether ALL visible rows are selected. */
  readonly allSelected = computed(() => {
    const rows = this.rows();
    if (rows.length === 0) {
      return false;
    }
    const sel = this.selected();
    return rows.every(r => sel.has(r.value()));
  });

  /** Whether SOME but not all rows are selected (indeterminate). */
  readonly someSelected = computed(() => {
    const rows = this.rows();
    const sel = this.selected();
    const count = rows.filter(r => sel.has(r.value())).length;
    return count > 0 && count < rows.length;
  });

  toggleAll(): void {
    if (this.allSelected()) {
      this.selected.set(new Set());
    } else {
      this.selected.set(new Set(this.rows().map(r => r.value())));
    }
  }

  toggleRow(value: unknown): void {
    const current = new Set(this.selected());
    if (current.has(value)) {
      current.delete(value);
    } else {
      current.add(value);
    }
    this.selected.set(current);
  }

  isSelected(value: unknown): boolean {
    return this.selected().has(value);
  }
}
