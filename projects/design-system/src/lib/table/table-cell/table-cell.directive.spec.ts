import { Component } from '@angular/core';
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
    <otp-table columns="1fr 1fr">
      <otp-table-row>
        <otp-table-cell>Cell A</otp-table-cell>
        <otp-table-cell>Cell B</otp-table-cell>
      </otp-table-row>
    </otp-table>
  `,
  imports: [TableComponent, TableRowComponent, TableCellDirective],
})
class CellHost {}

describe('TableCellDirective', () => {
  let fixture: ComponentFixture<CellHost>;
  let tableEl: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CellHost],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(CellHost);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    tableEl = fixture.nativeElement.querySelector('otp-table');
  });

  it('should create', () => {
    const cells = tableEl.querySelectorAll('otp-table-cell');
    expect(cells.length).toBeGreaterThan(0);
  });

  it('should have role="cell"', () => {
    const cells = tableEl.querySelectorAll('otp-table-cell');
    cells.forEach(c => expect(c.getAttribute('role')).toBe('cell'));
  });

  it('should apply table-cell class', () => {
    const cells = tableEl.querySelectorAll('otp-table-cell');
    cells.forEach(c => expect(c.classList.contains('table-cell')).toBe(true));
  });

  it('should apply label-md-fixed class', () => {
    const cells = tableEl.querySelectorAll('otp-table-cell');
    cells.forEach(c => expect(c.classList.contains('label-md-fixed')).toBe(true));
  });

  it('should render projected content', () => {
    const cells = tableEl.querySelectorAll('otp-table-cell');
    expect(cells[0].textContent?.trim()).toBe('Cell A');
    expect(cells[1].textContent?.trim()).toBe('Cell B');
  });
});
