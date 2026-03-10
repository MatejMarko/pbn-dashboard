import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import {
  TableComponent,
  TableRowComponent,
  TableCellDirective,
} from '../index';

@Component({
  template: `
    <otp-table columns="1fr" [selectable]="selectable()" [(selected)]="selected">
      @for (item of items; track item) {
        <otp-table-row [value]="item">
          <otp-table-cell>{{ item }}</otp-table-cell>
        </otp-table-row>
      }
    </otp-table>
  `,
  imports: [TableComponent, TableRowComponent, TableCellDirective],
})
class RowHost {
  items = ['A', 'B'];
  selectable = signal(false);
  selected = signal(new Set<unknown>());
}

describe('TableRowComponent', () => {
  let fixture: ComponentFixture<RowHost>;
  let host: RowHost;
  let tableEl: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RowHost],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(RowHost);
    host = fixture.componentInstance;
    fixture.autoDetectChanges();
    await fixture.whenStable();
    tableEl = fixture.nativeElement.querySelector('otp-table');
  });

  it('should have role="row"', () => {
    const row = tableEl.querySelector('otp-table-row');
    expect(row?.getAttribute('role')).toBe('row');
  });

  it('should apply table-row class', () => {
    const row = tableEl.querySelector('otp-table-row');
    expect(row?.classList.contains('table-row')).toBe(true);
  });

  it('should apply table-row-selected when selected', async () => {
    host.selected.set(new Set(['A']));
    await fixture.whenStable();

    const rows = tableEl.querySelectorAll('otp-table-row');
    expect(rows[0].classList.contains('table-row-selected')).toBe(true);
    expect(rows[1].classList.contains('table-row-selected')).toBe(false);
  });

  it('should not render checkbox when table is not selectable', () => {
    const checkbox = tableEl.querySelector('otp-table-row input[type="checkbox"]');
    expect(checkbox).toBeNull();
  });

  it('should render checkbox when table is selectable', async () => {
    host.selectable.set(true);
    await fixture.whenStable();

    const checkboxes = tableEl.querySelectorAll('otp-table-row input[type="checkbox"]');
    expect(checkboxes).toHaveLength(2);
  });
});
