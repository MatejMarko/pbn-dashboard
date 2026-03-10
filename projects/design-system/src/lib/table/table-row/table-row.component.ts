import { Component, computed, inject, input, signal, ViewEncapsulation } from '@angular/core';
import { TableComponent } from '../table/table.component';

@Component({
  selector: 'otp-table-row',
  template: `
    @if (table.selectable()) {
      <div class="table-cell" role="cell">
        <input
          type="checkbox"
          [checked]="isSelected()"
          (change)="table.toggleRow(value())"
          aria-label="Select row"
        />
      </div>
    }
    <ng-content></ng-content>
  `,
  encapsulation: ViewEncapsulation.None,
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
  protected isSelected = computed(() => this.table.isSelected(this.value()));
}
