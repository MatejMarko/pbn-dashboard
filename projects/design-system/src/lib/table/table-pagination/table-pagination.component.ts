import { Component, computed, input, output, ViewEncapsulation } from '@angular/core';
import { SvgComponent } from '../../svg/svg';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'otp-table-pagination',
  templateUrl: './table-pagination.component.html',
  encapsulation: ViewEncapsulation.None,
  imports: [SvgComponent, DecimalPipe],
  host: {
    '[class.table-pagination]': 'true',
  },
})
export class TablePaginationComponent {
  /** Current page (0-based). */
  readonly page = input.required<number>();

  /** Number of items per page. */
  readonly pageSize = input.required<number>();

  /** Total number of items. */
  readonly total = input.required<number>();

  /** Emits the new page number when the user navigates. */
  readonly pageChange = output<number>();

  protected totalPages = computed(() =>
    Math.ceil(this.total() / this.pageSize()),
  );

  protected rangeStart = computed(() =>
    this.page() * this.pageSize() + 1,
  );

  protected rangeEnd = computed(() =>
    Math.min((this.page() + 1) * this.pageSize(), this.total()),
  );

  protected hasPrevious = computed(() => this.page() > 0);
  protected hasNext = computed(() => this.page() < this.totalPages() - 1);

  goToPrevious(): void {
    if (this.hasPrevious()) {
      this.pageChange.emit(this.page() - 1);
    }
  }

  goToNext(): void {
    if (this.hasNext()) {
      this.pageChange.emit(this.page() + 1);
    }
  }
}
