import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import {
  TableComponent,
  TableRowComponent,
  TableCellDirective,
  TableFooterComponent,
  TableFooterActionsDirective,
} from '../index';

@Component({
  template: `
    <otp-table columns="1fr">
      <otp-table-row>
        <otp-table-cell>A</otp-table-cell>
      </otp-table-row>
      <otp-table-footer>
        <otp-table-footer-actions>
          <button>Export</button>
        </otp-table-footer-actions>
      </otp-table-footer>
    </otp-table>
  `,
  imports: [TableComponent, TableRowComponent, TableCellDirective, TableFooterComponent, TableFooterActionsDirective],
})
class FooterHost {}

describe('TableFooterComponent', () => {
  let fixture: ComponentFixture<FooterHost>;
  let tableEl: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FooterHost],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(FooterHost);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    tableEl = fixture.nativeElement.querySelector('otp-table');
  });

  it('should create', () => {
    const footer = tableEl.querySelector('otp-table-footer');
    expect(footer).toBeTruthy();
  });

  it('should apply table-footer class', () => {
    const footer = tableEl.querySelector('otp-table-footer');
    expect(footer?.classList.contains('table-footer')).toBe(true);
  });

  it('should project footer-actions content', () => {
    const actions = tableEl.querySelector('otp-table-footer-actions');
    expect(actions).toBeTruthy();
    expect(actions?.querySelector('button')?.textContent).toContain('Export');
  });
});
