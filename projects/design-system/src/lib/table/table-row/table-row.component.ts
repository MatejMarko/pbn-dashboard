import { Component, computed, inject, input, signal, ViewEncapsulation } from '@angular/core';
import { TableComponent } from '../table/table.component';
import { TableCellDirective } from '../table-cell/table-cell.directive';

@Component({
  selector: 'otp-table-row',
  templateUrl: './table-row.component.html',
  encapsulation: ViewEncapsulation.None,
  imports: [TableCellDirective],
  host: {
    'role': 'row',
    '[class.table-row]': 'true',
    '[class.table-row-selected]': 'isSelected()',
    '[class.table-row-hidden]': '_hidden()',
  },
})
export class TableRowComponent {
  protected readonly table = inject(TableComponent);

  /** Unique value identifying this row for selection tracking. */
  readonly value = input<unknown>();

  /** @internal Set by TableSectionComponent to hide overflow rows. */
  readonly _hidden = signal(false);

  /** Whether this row is currently selected. */
  protected readonly isSelected = computed(() => this.table.isSelected(this.value()));
}
