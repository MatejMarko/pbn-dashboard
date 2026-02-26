import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, signal } from '@angular/core';
import { DsButton } from './ds-button';
import { DsButtonColor, DsButtonSize, DsButtonVariant } from '../ds-button.types';

@Component({
  template: `
    <button ds-button
      [variant]="variant()"
      [color]="color()"
      [size]="size()"
      [isFloating]="isFloating()"
      [leadingIcon]="leadingIcon()"
      [disabled]="disabled()"
      (click)="onClick()">
      Button Text
    </button>
  `,
  imports: [DsButton],
})
class TestHostComponent {
  variant = signal<DsButtonVariant>('primary');
  color = signal<DsButtonColor>('green');
  size = signal<DsButtonSize>('md');
  isFloating = signal(false);
  leadingIcon = signal<string | null>(null);
  disabled = signal(false);
  onClick = vi.fn();
}

describe('DsButton', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let host: TestHostComponent;
  let buttonEl: HTMLButtonElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
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
        async (variant) => {
          host.variant.set(variant);
          await fixture.whenStable();
          expect(buttonEl.classList.contains(variant)).toBe(true);
        },
      );
    });

    describe('color', () => {
      it.each<DsButtonColor>(['green', 'orange', 'blue', 'red'])(
        'should apply "%s" color class',
        async (color) => {
          host.color.set(color);
          await fixture.whenStable();
          expect(buttonEl.classList.contains(color)).toBe(true);
        },
      );
    });

    describe('size', () => {
      it.each<DsButtonSize>(['xl', 'lg', 'md', 'sm'])(
        'should apply "%s" size class',
        async (size) => {
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
    it('should project text content via ng-content', () => {
      const span = buttonEl.querySelector('span.body-md-bold-fixed');
      expect(span).toBeTruthy();
      expect(span!.textContent!.trim()).toBe('Button Text');
    });

    it('should not render SVG when leadingIcon is null', () => {
      const svg = buttonEl.querySelector('svg');
      expect(svg).toBeNull();
    });

    it('should render SVG when leadingIcon is set', async () => {
      host.leadingIcon.set('some-icon');
      await fixture.whenStable();
      const svg = buttonEl.querySelector('svg');
      expect(svg).toBeTruthy();
    });

    it('should render icon at 1rem when size is sm', async () => {
      host.leadingIcon.set('some-icon');
      host.size.set('sm');
      await fixture.whenStable();
      const svg = buttonEl.querySelector('svg')!;
      expect(svg.getAttribute('width')).toBe('1rem');
      expect(svg.getAttribute('height')).toBe('1rem');
    });

    it('should render icon at 1.5rem for non-sm sizes', async () => {
      host.leadingIcon.set('some-icon');
      host.size.set('md');
      await fixture.whenStable();
      const svg = buttonEl.querySelector('svg')!;
      expect(svg.getAttribute('width')).toBe('1.5rem');
      expect(svg.getAttribute('height')).toBe('1.5rem');
    });
  });

  // 4. Native button behavior
  describe('native button behavior', () => {

    it('should support disabled attribute', async () => {
      host.disabled.set(true);
      await fixture.whenStable();
      expect(buttonEl.disabled).toBe(true);
    });
  });

  // 5. Accessibility
  describe('accessibility', () => {

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
