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
          <button>Delete</button>
          <button>Archive</button>
        </otp-table-footer-actions>
      </otp-table-footer>
    </otp-table>
  `,
  imports: [TableComponent, TableRowComponent, TableCellDirective, TableFooterComponent, TableFooterActionsDirective],
})
class FooterActionsHost {}

describe('TableFooterActionsDirective', () => {
  let fixture: ComponentFixture<FooterActionsHost>;
  let tableEl: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FooterActionsHost],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(FooterActionsHost);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    tableEl = fixture.nativeElement.querySelector('otp-table');
  });

  it('should create', () => {
    const actions = tableEl.querySelector('otp-table-footer-actions');
    expect(actions).toBeTruthy();
  });

  it('should apply table-footer-actions class', () => {
    const actions = tableEl.querySelector('otp-table-footer-actions');
    expect(actions?.classList.contains('table-footer-actions')).toBe(true);
  });

  it('should render projected content', () => {
    const actions = tableEl.querySelector('otp-table-footer-actions');
    const buttons = actions?.querySelectorAll('button');
    expect(buttons).toHaveLength(2);
    expect(buttons?.[0].textContent).toContain('Delete');
    expect(buttons?.[1].textContent).toContain('Archive');
  });
});
