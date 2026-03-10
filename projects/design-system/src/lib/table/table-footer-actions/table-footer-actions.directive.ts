import { Directive } from '@angular/core';

@Directive({
  selector: 'otp-table-footer-actions',
  host: {
    '[class.table-footer-actions]': 'true',
  },
})
export class TableFooterActionsDirective {}
