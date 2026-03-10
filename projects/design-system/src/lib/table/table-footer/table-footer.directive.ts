import { Directive } from '@angular/core';

@Directive({
  selector: 'otp-table-footer',
  host: {
    '[style.grid-column]': '"1 / -1"',
    '[class.table-footer]': 'true',
  },
})
export class TableFooterDirective {}
