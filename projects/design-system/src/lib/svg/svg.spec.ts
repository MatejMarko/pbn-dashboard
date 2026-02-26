import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, signal } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { SvgComponent } from './svg';

const MOCK_SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/></svg>';

@Component({
  template: `<otp-svg [name]="name()" [size]="size()"></otp-svg>`,
  imports: [SvgComponent],
})
class TestHostComponent {
  name = signal('test-icon');
  size = signal<number | string | null>('1.5rem');
}

describe('SvgComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let host: TestHostComponent;
  let httpTesting: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    httpTesting = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(TestHostComponent);
    host = fixture.componentInstance;
    fixture.autoDetectChanges();
    await fixture.whenStable();
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should create', () => {
    httpTesting.expectOne('/assets/svg/test-icon.svg').flush(MOCK_SVG);
    const otpSvg = fixture.nativeElement.querySelector('otp-svg');
    expect(otpSvg).toBeTruthy();
  });

  it('should fetch and render the SVG', async () => {
    httpTesting.expectOne('/assets/svg/test-icon.svg').flush(MOCK_SVG);
    await fixture.whenStable();
    const svg = fixture.nativeElement.querySelector('otp-svg svg');
    expect(svg).toBeTruthy();
  });

  it('should apply sizing from size input', async () => {
    httpTesting.expectOne('/assets/svg/test-icon.svg').flush(MOCK_SVG);
    await fixture.whenStable();
    const otpSvg = fixture.nativeElement.querySelector('otp-svg') as HTMLElement;
    expect(otpSvg.style.width).toBe('1.5rem');
    expect(otpSvg.style.height).toBe('1.5rem');
  });

  it('should apply numeric size as pixels', async () => {
    host.size.set(24);
    httpTesting.expectOne('/assets/svg/test-icon.svg').flush(MOCK_SVG);
    await fixture.whenStable();
    const otpSvg = fixture.nativeElement.querySelector('otp-svg') as HTMLElement;
    expect(otpSvg.style.width).toBe('24px');
    expect(otpSvg.style.height).toBe('24px');
  });

  it('should fetch a new SVG when name changes', async () => {
    httpTesting.expectOne('/assets/svg/test-icon.svg').flush(MOCK_SVG);
    await fixture.whenStable();

    host.name.set('other-icon');
    await fixture.whenStable();
    httpTesting.expectOne('/assets/svg/other-icon.svg').flush(MOCK_SVG);
  });
});
