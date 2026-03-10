import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import {
  TableComponent,
  TableHeaderComponent,
  TableHeaderCellDirective,
  TableRowComponent,
  TableCellDirective,
} from '../index';

@Component({
  template: `
    <otp-table columns="1fr" [selectable]="selectable()" [(selected)]="selected">
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
class HeaderHost {
  items = ['A', 'B', 'C'];
  selectable = signal(false);
  selected = signal(new Set<unknown>());
}

describe('TableHeaderComponent', () => {
  let fixture: ComponentFixture<HeaderHost>;
  let host: HeaderHost;
  let tableEl: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderHost],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderHost);
    host = fixture.componentInstance;
    fixture.autoDetectChanges();
    await fixture.whenStable();
    tableEl = fixture.nativeElement.querySelector('otp-table');
  });

  it('should have role="rowgroup"', () => {
    const header = tableEl.querySelector('otp-table-header');
    expect(header?.getAttribute('role')).toBe('rowgroup');
  });

  it('should not have inline display style (styled via stylesheet)', () => {
    const header = tableEl.querySelector('otp-table-header') as HTMLElement;
    expect(header.style.display).toBe('');
  });

  it('should not render checkbox when not selectable', () => {
    const checkbox = tableEl.querySelector('otp-table-header input[type="checkbox"]');
    expect(checkbox).toBeNull();
  });

  it('should render checkbox when selectable', async () => {
    host.selectable.set(true);
    await fixture.whenStable();

    const checkbox = tableEl.querySelector('otp-table-header input[type="checkbox"]');
    expect(checkbox).toBeTruthy();
  });

  it('should show indeterminate state when some rows selected', async () => {
    host.selectable.set(true);
    host.selected.set(new Set(['A']));
    await fixture.whenStable();

    const checkbox = tableEl.querySelector('otp-table-header input[type="checkbox"]') as HTMLInputElement;
    expect(checkbox.indeterminate).toBe(true);
  });
});
