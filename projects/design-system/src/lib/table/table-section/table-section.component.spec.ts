import { Component, signal, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideMockSvg } from '../../../test-utils/mock-svg';
import {
  TableComponent,
  TableHeaderComponent,
  TableHeaderCellDirective,
  TableRowComponent,
  TableCellDirective,
  TableSectionComponent,
} from '../index';

@Component({
  template: `
    <otp-table columns="1fr">
      <otp-table-header>
        <otp-table-header-cell>Name</otp-table-header-cell>
      </otp-table-header>
      <otp-table-section label="Group A" [expandLimit]="expandLimit()">
        @for (item of items; track item) {
          <otp-table-row>
            <otp-table-cell>{{ item }}</otp-table-cell>
          </otp-table-row>
        }
      </otp-table-section>
    </otp-table>
  `,
  imports: [TableComponent, TableHeaderComponent, TableHeaderCellDirective, TableRowComponent, TableCellDirective, TableSectionComponent],
})
class SectionHost {
  items = ['A', 'B', 'C', 'D', 'E'];
  expandLimit = signal(0);
  section = viewChild(TableSectionComponent);
}

/** Dispatch a synthetic transitionend event on the rows wrapper to complete the animation. */
function finishAnimation(tableEl: HTMLElement): void {
  const wrapper = tableEl.querySelector('.table-section-rows') as HTMLElement;
  if (wrapper) {
    wrapper.dispatchEvent(
      new TransitionEvent('transitionend', {
        propertyName: 'max-height',
        bubbles: true,
      }),
    );
  }
}

describe('TableSectionComponent', () => {
  let fixture: ComponentFixture<SectionHost>;
  let host: SectionHost;
  let tableEl: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SectionHost],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideMockSvg()],
    }).compileComponents();

    fixture = TestBed.createComponent(SectionHost);
    host = fixture.componentInstance;
    fixture.autoDetectChanges();
    await fixture.whenStable();
    tableEl = fixture.nativeElement.querySelector('otp-table');
  });

  it('should render section header with label', () => {
    const header = tableEl.querySelector('.table-section-header');
    expect(header?.textContent).toContain('Group A');
  });

  it('should render section header spanning all columns', () => {
    const header = tableEl.querySelector('.table-section-header') as HTMLElement;
    expect(header.style.gridColumn).toBe('1 / -1');
  });

  it('should render all rows when no expandLimit', () => {
    const rows = tableEl.querySelectorAll('otp-table-row');
    expect(rows).toHaveLength(5);
    rows.forEach(r => expect(r.classList.contains('table-row-hidden')).toBe(false));
  });

  it('should hide rows beyond expandLimit', async () => {
    host.expandLimit.set(2);
    await fixture.whenStable();

    const rows = tableEl.querySelectorAll('otp-table-row');
    expect(rows[0].classList.contains('table-row-hidden')).toBe(false);
    expect(rows[1].classList.contains('table-row-hidden')).toBe(false);
    expect(rows[2].classList.contains('table-row-hidden')).toBe(true);
    expect(rows[3].classList.contains('table-row-hidden')).toBe(true);
    expect(rows[4].classList.contains('table-row-hidden')).toBe(true);
  });

  it('should show "Show more" button when rows exceed expandLimit', async () => {
    host.expandLimit.set(2);
    await fixture.whenStable();

    const btn = tableEl.querySelector('.table-section-toggle-btn');
    expect(btn?.textContent).toContain('Show more (3)');
  });

  it('should not show "Show more" when no expandLimit', () => {
    const btn = tableEl.querySelector('.table-section-toggle-btn');
    expect(btn).toBeNull();
  });

  it('should reveal all rows when "Show more" is clicked', async () => {
    host.expandLimit.set(2);
    await fixture.whenStable();

    const btn = tableEl.querySelector('.table-section-toggle-btn') as HTMLButtonElement;
    btn.click();
    finishAnimation(tableEl);
    await fixture.whenStable();

    const rows = tableEl.querySelectorAll('otp-table-row');
    rows.forEach(r => expect(r.classList.contains('table-row-hidden')).toBe(false));
  });

  it('should show "Show less" after expanding', async () => {
    host.expandLimit.set(2);
    await fixture.whenStable();

    const showMoreBtn = tableEl.querySelector('.table-section-toggle-btn') as HTMLButtonElement;
    showMoreBtn.click();
    finishAnimation(tableEl);
    await fixture.whenStable();

    const btn = tableEl.querySelector('.table-section-toggle-btn');
    expect(btn?.textContent).toContain('Show less');
  });

  it('should collapse all rows when section header is clicked', async () => {
    const header = tableEl.querySelector('.table-section-header') as HTMLElement;
    header.click();
    finishAnimation(tableEl);
    await fixture.whenStable();

    const rows = tableEl.querySelectorAll('otp-table-row');
    rows.forEach(r => expect(r.classList.contains('table-row-hidden')).toBe(true));
  });

  it('should set aria-expanded on section header', async () => {
    const header = tableEl.querySelector('.table-section-header') as HTMLElement;
    expect(header.getAttribute('aria-expanded')).toBe('true');

    header.click();
    finishAnimation(tableEl);
    await fixture.whenStable();
    expect(header.getAttribute('aria-expanded')).toBe('false');
  });
});
