import { Component, inject, ViewEncapsulation } from '@angular/core';
import { TableComponent } from '../table/table.component';
import { TableHeaderCellDirective } from '../table-header-cell/table-header-cell.directive';

@Component({
  selector: 'otp-table-header',
  template: `
    @if (table.selectable()) {
      <otp-table-header-cell>
        <input
          type="checkbox"
          [checked]="table.allSelected()"
          [indeterminate]="table.someSelected()"
          (change)="table.toggleAll()"
          aria-label="Select all rows"
        />
      </otp-table-header-cell>
    }
    <ng-content></ng-content>
  `,
  encapsulation: ViewEncapsulation.None,
  imports: [TableHeaderCellDirective],
  host: {
    'role': 'rowgroup',
    '[class.table-header]': 'true',
  },
})
export class TableHeaderComponent {
  protected readonly table = inject(TableComponent);
}
