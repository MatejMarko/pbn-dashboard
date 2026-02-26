import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, signal } from '@angular/core';
import { DsIconButton } from './ds-icon-button';
import { DsButtonColor, DsButtonSize, DsButtonVariant } from '../ds-button.types';
import { provideMockSvg } from '../../../test-utils/mock-svg';

@Component({
  template: `
    <button ds-icon-button
      [variant]="variant()"
      [color]="color()"
      [size]="size()"
      [isFloating]="isFloating()"
      [icon]="icon()"
      [ariaLabel]="ariaLabel()"
      [disabled]="disabled()"
      (click)="onClick()">
    </button>
  `,
  imports: [DsIconButton],
})
class TestHostComponent {
  variant = signal<DsButtonVariant>('primary');
  color = signal<DsButtonColor>('green');
  size = signal<DsButtonSize>('md');
  isFloating = signal(false);
  icon = signal('test-icon');
  ariaLabel = signal('Test action');
  disabled = signal(false);
  onClick = vi.fn();
}

describe('DsIconButton', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let host: TestHostComponent;
  let buttonEl: HTMLButtonElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
      providers: [provideMockSvg()],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    host = fixture.componentInstance;
    fixture.autoDetectChanges();
    await fixture.whenStable();
    buttonEl = fixture.nativeElement.querySelector('button');
  });

  // 1. Creation & defaults
  describe('creation & defaults', () => {
    it('should create', () => {
      expect(buttonEl).toBeTruthy();
    });

    it('should apply default classes: primary md green', () => {
      expect(buttonEl.classList.contains('primary')).toBe(true);
      expect(buttonEl.classList.contains('md')).toBe(true);
      expect(buttonEl.classList.contains('green')).toBe(true);
    });

    it('should not have floating class by default', () => {
      expect(buttonEl.classList.contains('floating')).toBe(false);
    });
  });

  // 2. Host class composition
  describe('class composition', () => {
    describe('variant', () => {
      it.each<DsButtonVariant>(['primary', 'secondary', 'tertiary'])(
        'should apply "%s" variant class',
        async (variant: DsButtonVariant) => {
          host.variant.set(variant);
          await fixture.whenStable();
          expect(buttonEl.classList.contains(variant)).toBe(true);
        },
      );
    });

    describe('color', () => {
      it.each<DsButtonColor>(['green', 'orange', 'blue', 'red'])(
        'should apply "%s" color class',
        async (color: DsButtonColor) => {
          host.color.set(color);
          await fixture.whenStable();
          expect(buttonEl.classList.contains(color)).toBe(true);
        },
      );
    });

    describe('size', () => {
      it.each<DsButtonSize>(['xl', 'lg', 'md', 'sm'])(
        'should apply "%s" size class',
        async (size: DsButtonSize) => {
          host.size.set(size);
          await fixture.whenStable();
          expect(buttonEl.classList.contains(size)).toBe(true);
        },
      );
    });

    it('should add "floating" class when isFloating is true', async () => {
      host.isFloating.set(true);
      await fixture.whenStable();
      expect(buttonEl.classList.contains('floating')).toBe(true);
    });

    it('should combine multiple inputs correctly', async () => {
      host.variant.set('secondary');
      host.color.set('blue');
      host.size.set('lg');
      host.isFloating.set(true);
      await fixture.whenStable();

      expect(buttonEl.classList.contains('secondary')).toBe(true);
      expect(buttonEl.classList.contains('blue')).toBe(true);
      expect(buttonEl.classList.contains('lg')).toBe(true);
      expect(buttonEl.classList.contains('floating')).toBe(true);
    });

    it('should remove previous variant class when variant changes', async () => {
      host.variant.set('secondary');
      await fixture.whenStable();
      expect(buttonEl.classList.contains('secondary')).toBe(true);
      expect(buttonEl.classList.contains('primary')).toBe(false);
    });
  });

  // 3. Template rendering
  describe('template rendering', () => {
    it('should always render an SVG icon', () => {
      const otpSvg = buttonEl.querySelector('otp-svg');
      expect(otpSvg).toBeTruthy();
    });

    it('should pass size "1rem" to otp-svg when button size is sm', async () => {
      host.size.set('sm');
      await fixture.whenStable();
      const otpSvg = buttonEl.querySelector('otp-svg') as HTMLElement;
      expect(otpSvg.style.width).toBe('1rem');
      expect(otpSvg.style.height).toBe('1rem');
    });

    it.each<DsButtonSize>(['xl', 'lg', 'md'])(
      'should pass size "1.5rem" to otp-svg when button size is "%s"',
      async (size) => {
        host.size.set(size);
        await fixture.whenStable();
        const otpSvg = buttonEl.querySelector('otp-svg') as HTMLElement;
        expect(otpSvg.style.width).toBe('1.5rem');
        expect(otpSvg.style.height).toBe('1.5rem');
      },
    );

    it('should not render user-provided text content between tags', async () => {
      @Component({
        template: `<button ds-icon-button icon="test" ariaLabel="Test">Some text</button>`,
        imports: [DsIconButton],
      })
      class HostWithTextComponent {}

      const textFixture = TestBed.createComponent(HostWithTextComponent);
      textFixture.autoDetectChanges();
      await textFixture.whenStable();
      await textFixture.whenStable();
      const btn = textFixture.nativeElement.querySelector('button') as HTMLButtonElement;

      expect(btn.textContent!.trim()).not.toContain('Some text');
      expect(btn.querySelector('otp-svg')).toBeTruthy();
    });
  });

  // 4. Accessibility
  describe('accessibility', () => {
    it('should set aria-label from input', () => {
      expect(buttonEl.getAttribute('aria-label')).toBe('Test action');
    });

    it('should update aria-label when input changes', async () => {
      host.ariaLabel.set('Updated label');
      await fixture.whenStable();
      expect(buttonEl.getAttribute('aria-label')).toBe('Updated label');
    });

    it('should be focusable', () => {
      buttonEl.focus();
      expect(document.activeElement).toBe(buttonEl);
    });

    it('should not be focusable when disabled', async () => {
      host.disabled.set(true);
      await fixture.whenStable();
      buttonEl.focus();
      expect(document.activeElement).not.toBe(buttonEl);
    });
  });

  // 5. Native button behavior
  describe('native button behavior', () => {
    it('should support disabled attribute', async () => {
      host.disabled.set(true);
      await fixture.whenStable();
      expect(buttonEl.disabled).toBe(true);
    });
  });

  // 6. Click events
  describe('click events', () => {
    it('should fire click handler on enabled button', () => {
      buttonEl.click();
      expect(host.onClick).toHaveBeenCalledTimes(1);
    });

    it('should not fire click handler on disabled button', async () => {
      host.disabled.set(true);
      await fixture.whenStable();
      buttonEl.click();
      expect(host.onClick).not.toHaveBeenCalled();
    });
  });
});
