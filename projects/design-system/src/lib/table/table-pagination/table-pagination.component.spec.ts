import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideMockSvg } from '../../../test-utils/mock-svg';
import { TablePaginationComponent } from './table-pagination.component';

@Component({
  template: `
    <otp-table-pagination
      [page]="page()"
      [pageSize]="10"
      [total]="total()"
      (pageChange)="onPageChange($event)"
    />
  `,
  imports: [TablePaginationComponent],
})
class PaginationHost {
  page = signal(0);
  total = signal(100);
  onPageChange = vi.fn();
}

describe('TablePaginationComponent', () => {
  let fixture: ComponentFixture<PaginationHost>;
  let host: PaginationHost;
  let el: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaginationHost],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideMockSvg()],
    }).compileComponents();

    fixture = TestBed.createComponent(PaginationHost);
    host = fixture.componentInstance;
    fixture.autoDetectChanges();
    await fixture.whenStable();
    el = fixture.nativeElement;
  });

  it('should display range text', () => {
    const range = el.querySelector('.table-pagination-range');
    expect(range?.textContent).toContain('1 - 10');
    expect(range?.textContent).toContain('100');
  });

  it('should disable previous button on first page', () => {
    const prevBtn = el.querySelector('[aria-label="Previous page"]') as HTMLButtonElement;
    expect(prevBtn.disabled).toBe(true);
  });

  it('should enable next button when not on last page', () => {
    const nextBtn = el.querySelector('[aria-label="Next page"]') as HTMLButtonElement;
    expect(nextBtn.disabled).toBe(false);
  });

  it('should emit next page on next click', async () => {
    const nextBtn = el.querySelector('[aria-label="Next page"]') as HTMLButtonElement;
    nextBtn.click();
    await fixture.whenStable();
    expect(host.onPageChange).toHaveBeenCalledWith(1);
  });

  it('should emit previous page on previous click', async () => {
    host.page.set(4);
    await fixture.whenStable();

    const prevBtn = el.querySelector('[aria-label="Previous page"]') as HTMLButtonElement;
    prevBtn.click();
    await fixture.whenStable();
    expect(host.onPageChange).toHaveBeenCalledWith(3);
  });

  it('should disable next button on last page', async () => {
    host.page.set(9);
    await fixture.whenStable();

    const nextBtn = el.querySelector('[aria-label="Next page"]') as HTMLButtonElement;
    expect(nextBtn.disabled).toBe(true);
  });

  it('should update range text on page change', async () => {
    host.page.set(2);
    await fixture.whenStable();

    const range = el.querySelector('.table-pagination-range');
    expect(range?.textContent).toContain('21 - 30');
  });

  it('should show correct range on last page with partial results', async () => {
    host.total.set(95);
    host.page.set(9);
    await fixture.whenStable();

    const range = el.querySelector('.table-pagination-range');
    expect(range?.textContent).toContain('91 - 95');
  });
});
