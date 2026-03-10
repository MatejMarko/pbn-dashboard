import { Component, inject, ViewEncapsulation } from '@angular/core';
import { TableComponent } from '../table/table.component';
import { TableHeaderCellDirective } from '../table-header-cell/table-header-cell.directive';

@Component({
  selector: 'otp-table-header',
  templateUrl: './table-header.component.html',
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
