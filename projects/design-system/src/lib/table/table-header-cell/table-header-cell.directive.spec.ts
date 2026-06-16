import { Component } from '@angular/core';
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
    <otp-table columns="1fr 1fr">
      <otp-table-header>
        <otp-table-header-cell>Name</otp-table-header-cell>
        <otp-table-header-cell>Value</otp-table-header-cell>
      </otp-table-header>
      <otp-table-row>
        <otp-table-cell>A</otp-table-cell>
        <otp-table-cell>1</otp-table-cell>
      </otp-table-row>
    </otp-table>
  `,
  imports: [TableComponent, TableHeaderComponent, TableHeaderCellDirective, TableRowComponent, TableCellDirective],
})
class HeaderCellHost {}

describe('TableHeaderCellDirective', () => {
  let fixture: ComponentFixture<HeaderCellHost>;
  let tableEl: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderCellHost],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderCellHost);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    tableEl = fixture.nativeElement.querySelector('otp-table');
  });

  it('should create', () => {
    const cells = tableEl.querySelectorAll('otp-table-header-cell');
    expect(cells.length).toBeGreaterThan(0);
  });

  it('should have role="columnheader"', () => {
    const cells = tableEl.querySelectorAll('otp-table-header-cell');
    cells.forEach(c => expect(c.getAttribute('role')).toBe('columnheader'));
  });

  it('should apply table-header-cell class', () => {
    const cells = tableEl.querySelectorAll('otp-table-header-cell');
    cells.forEach(c => expect(c.classList.contains('table-header-cell')).toBe(true));
  });

  it('should apply label-md-fixed class', () => {
    const cells = tableEl.querySelectorAll('otp-table-header-cell');
    cells.forEach(c => expect(c.classList.contains('label-md-fixed')).toBe(true));
  });

  it('should apply text-secondary class', () => {
    const cells = tableEl.querySelectorAll('otp-table-header-cell');
    cells.forEach(c => expect(c.classList.contains('text-secondary')).toBe(true));
  });

  it('should render projected content', () => {
    const cells = tableEl.querySelectorAll('otp-table-header-cell');
    expect(cells[0].textContent?.trim()).toBe('Name');
    expect(cells[1].textContent?.trim()).toBe('Value');
  });
});
