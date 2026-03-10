import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import {
  OTP_TABLE,
  TableComponent,
  TableHeaderComponent,
  TableHeaderCellDirective,
  TableRowComponent,
  TableCellDirective,
  TableFooterDirective,
} from '../index';

// ── Basic table ─────────────────────────────────────────────────────────────

@Component({
  template: `
    <otp-table columns="1fr 1fr">
      <otp-table-header>
        <otp-table-header-cell>Name</otp-table-header-cell>
        <otp-table-header-cell>Value</otp-table-header-cell>
      </otp-table-header>
      @for (item of items; track item.name) {
        <otp-table-row>
          <otp-table-cell>{{ item.name }}</otp-table-cell>
          <otp-table-cell>{{ item.value }}</otp-table-cell>
        </otp-table-row>
      }
    </otp-table>
  `,
  imports: [TableComponent, TableHeaderComponent, TableHeaderCellDirective, TableRowComponent, TableCellDirective],
})
class BasicTableHost {
  items = [
    { name: 'A', value: 1 },
    { name: 'B', value: 2 },
  ];
}

// ── Selectable table ────────────────────────────────────────────────────────

@Component({
  template: `
    <otp-table columns="1fr" [selectable]="true" [(selected)]="selected">
      <otp-table-header>
        <otp-table-header-cell>Name</otp-table-header-cell>
      </otp-table-header>
      @for (item of items; track item) {
        <otp-table-row [value]="item">
          <otp-table-cell>{{ item }}</otp-table-cell>
        </otp-table-row>
      }
    </otp-table>
  `,
  imports: [TableComponent, TableHeaderComponent, TableHeaderCellDirective, TableRowComponent, TableCellDirective],
})
class SelectableTableHost {
  items = ['A', 'B', 'C'];
  selected = signal(new Set<unknown>());
}

// ── Table with footer ───────────────────────────────────────────────────────

@Component({
  template: `
    <otp-table columns="1fr">
      <otp-table-header>
        <otp-table-header-cell>Name</otp-table-header-cell>
      </otp-table-header>
      <otp-table-row>
        <otp-table-cell>A</otp-table-cell>
      </otp-table-row>
      <otp-table-footer>
        <button>Export</button>
      </otp-table-footer>
    </otp-table>
  `,
  imports: [TableComponent, TableHeaderComponent, TableHeaderCellDirective, TableRowComponent, TableCellDirective, TableFooterDirective],
})
class FooterTableHost {}

// ── Tests ───────────────────────────────────────────────────────────────────

describe('TableComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BasicTableHost, SelectableTableHost, FooterTableHost],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
  });

  describe('basic table', () => {
    let fixture: ComponentFixture<BasicTableHost>;
    let tableEl: HTMLElement;

    beforeEach(async () => {
      fixture = TestBed.createComponent(BasicTableHost);
      fixture.autoDetectChanges();
      await fixture.whenStable();
      tableEl = fixture.nativeElement.querySelector('otp-table');
    });

    it('should render with role="table"', () => {
      expect(tableEl.getAttribute('role')).toBe('table');
    });

    it('should apply grid-template-columns', () => {
      expect(tableEl.style.gridTemplateColumns).toBe('1fr 1fr');
    });

    it('should render header cells with role="columnheader"', () => {
      const headers = tableEl.querySelectorAll('otp-table-header-cell');
      expect(headers).toHaveLength(2);
      headers.forEach(h => expect(h.getAttribute('role')).toBe('columnheader'));
    });

    it('should render data rows with role="row"', () => {
      const rows = tableEl.querySelectorAll('otp-table-row');
      expect(rows).toHaveLength(2);
      rows.forEach(r => expect(r.getAttribute('role')).toBe('row'));
    });

    it('should render data cells with role="cell"', () => {
      const cells = tableEl.querySelectorAll('otp-table-cell');
      expect(cells).toHaveLength(4);
      cells.forEach(c => expect(c.getAttribute('role')).toBe('cell'));
    });

    it('should not show checkboxes when selectable is false', () => {
      const checkboxes = tableEl.querySelectorAll('input[type="checkbox"]');
      expect(checkboxes).toHaveLength(0);
    });
  });

  describe('selectable table', () => {
    let fixture: ComponentFixture<SelectableTableHost>;
    let host: SelectableTableHost;
    let tableEl: HTMLElement;

    beforeEach(async () => {
      fixture = TestBed.createComponent(SelectableTableHost);
      host = fixture.componentInstance;
      fixture.autoDetectChanges();
      await fixture.whenStable();
      tableEl = fixture.nativeElement.querySelector('otp-table');
    });

    it('should prepend checkbox column to grid-template-columns', () => {
      expect(tableEl.style.gridTemplateColumns).toBe('2.5rem 1fr');
    });

    it('should render checkbox in header', () => {
      const headerCheckbox = tableEl.querySelector('otp-table-header input[type="checkbox"]');
      expect(headerCheckbox).toBeTruthy();
    });

    it('should render checkbox per row', () => {
      const rowCheckboxes = tableEl.querySelectorAll('otp-table-row input[type="checkbox"]');
      expect(rowCheckboxes).toHaveLength(3);
    });

    it('should toggle row selection on checkbox click', async () => {
      const rowCheckbox = tableEl.querySelector('otp-table-row input[type="checkbox"]') as HTMLInputElement;
      rowCheckbox.click();
      await fixture.whenStable();
      expect(host.selected().has('A')).toBe(true);
    });

    it('should select all on header checkbox click', async () => {
      const headerCheckbox = tableEl.querySelector('otp-table-header input[type="checkbox"]') as HTMLInputElement;
      headerCheckbox.click();
      await fixture.whenStable();
      expect(host.selected().size).toBe(3);
    });

    it('should deselect all when all selected and header checkbox clicked', async () => {
      host.selected.set(new Set(['A', 'B', 'C']));
      await fixture.whenStable();

      const headerCheckbox = tableEl.querySelector('otp-table-header input[type="checkbox"]') as HTMLInputElement;
      headerCheckbox.click();
      await fixture.whenStable();
      expect(host.selected().size).toBe(0);
    });

    it('should add selected class to selected rows', async () => {
      host.selected.set(new Set(['B']));
      await fixture.whenStable();

      const rows = tableEl.querySelectorAll('otp-table-row');
      expect(rows[0].classList.contains('table-row-selected')).toBe(false);
      expect(rows[1].classList.contains('table-row-selected')).toBe(true);
      expect(rows[2].classList.contains('table-row-selected')).toBe(false);
    });
  });

  describe('footer', () => {
    it('should render footer content', async () => {
      const fixture = TestBed.createComponent(FooterTableHost);
      fixture.autoDetectChanges();
      await fixture.whenStable();

      const footer = fixture.nativeElement.querySelector('otp-table-footer');
      expect(footer).toBeTruthy();
      expect(footer.querySelector('button')?.textContent).toContain('Export');
    });
  });
});
