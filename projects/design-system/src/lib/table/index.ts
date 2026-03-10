import { TableComponent } from './table/table.component';
import { TableHeaderComponent } from './table-header/table-header.component';
import { TableHeaderCellDirective } from './table-header-cell/table-header-cell.directive';
import { TableRowComponent } from './table-row/table-row.component';
import { TableCellDirective } from './table-cell/table-cell.directive';
import { TableSectionComponent } from './table-section/table-section.component';
import { TablePaginationComponent } from './table-pagination/table-pagination.component';
import { TableFooterComponent } from './table-footer/table-footer.component';
import { TableFooterActionsDirective } from './table-footer-actions/table-footer-actions.directive';

export * from './table/table.component';
export * from './table-header/table-header.component';
export * from './table-header-cell/table-header-cell.directive';
export * from './table-row/table-row.component';
export * from './table-cell/table-cell.directive';
export * from './table-section/table-section.component';
export * from './table-pagination/table-pagination.component';
export * from './table-footer/table-footer.component';
export * from './table-footer-actions/table-footer-actions.directive';

/** All table directives/components needed to use `<otp-table>`. */
export const OTP_TABLE = [
  TableComponent,
  TableHeaderComponent,
  TableHeaderCellDirective,
  TableRowComponent,
  TableCellDirective,
  TableSectionComponent,
  TablePaginationComponent,
  TableFooterComponent,
  TableFooterActionsDirective,
] as const;
