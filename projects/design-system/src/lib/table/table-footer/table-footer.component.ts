import { Component, ViewEncapsulation, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'otp-table-footer',
  templateUrl: './table-footer.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.Eager,
  host: {
    '[class.table-footer]': 'true',
  },
})
export class TableFooterComponent {}
