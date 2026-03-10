import { Directive } from '@angular/core';

@Directive({
  selector: 'otp-table-header-cell',
  host: {
    'role': 'columnheader',
    '[class.table-header-cell]': 'true',
    '[class.label-md-fixed]': 'true',
    '[class.text-secondary]': 'true',
  },
})
export class TableHeaderCellDirective {}
