import { Component, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'otp-table-footer',
  templateUrl: './table-footer.component.html',
  encapsulation: ViewEncapsulation.None,
  host: {
    '[class.table-footer]': 'true',
  },
})
export class TableFooterComponent {}
