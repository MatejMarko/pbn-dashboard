import { TableComponent } from './table/table.component';
import { TableHeaderComponent } from './table-header/table-header.component';
import { TableHeaderCellDirective } from './table-header-cell/table-header-cell.directive';
import { TableRowComponent } from './table-row/table-row.component';
import { TableCellDirective } from './table-cell/table-cell.directive';
import { TableSectionComponent } from './table-section/table-section.component';
import { TablePaginationComponent } from './table-pagination/table-pagination.component';
import { TableFooterDirective } from './table-footer/table-footer.directive';

export * from './table/table.component';
export * from './table-header/table-header.component';
export * from './table-header-cell/table-header-cell.directive';
export * from './table-row/table-row.component';
export * from './table-cell/table-cell.directive';
export * from './table-section/table-section.component';
export * from './table-pagination/table-pagination.component';
export * from './table-footer/table-footer.directive';

/** All table directives/components needed to use `<otp-table>`. */
export const OTP_TABLE = [
  TableComponent,
  TableHeaderComponent,
  TableHeaderCellDirective,
  TableRowComponent,
  TableCellDirective,
  TableSectionComponent,
  TablePaginationComponent,
  TableFooterDirective,
] as const;
