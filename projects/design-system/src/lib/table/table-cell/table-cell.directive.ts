import { Directive } from '@angular/core';

@Directive({
  selector: 'otp-table-cell',
  host: {
    'role': 'cell',
    '[class.table-cell]': 'true',
    '[class.label-md-fixed]': 'true',
  },
})
export class TableCellDirective {}
