import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, signal } from '@angular/core';
import { GhostButton } from './ghost-button';
import { DsButtonColor } from '../ds-button.types';
import { provideMockSvg } from '../../../test-utils/mock-svg';

@Component({
  template: `
    <button ds-ghost-button
      [purposeType]="purposeType()"
      [color]="color()"
      [icon]="icon()"
      [direction]="direction()"
      [disabled]="disabled()"
      (click)="onClick()">
      Ghost Text
    </button>
  `,
  imports: [GhostButton],
})
class TestHostComponent {
  purposeType = signal<'action' | 'navigation'>('action');
  color = signal<DsButtonColor>('green');
  icon = signal<string | null>(null);
  direction = signal<'up' | 'down' | 'right' | 'left'>('right');
  disabled = signal(false);
  onClick = vi.fn();
}

describe('GhostButton', () => {
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

    it('should apply default color class "green"', () => {
      expect(buttonEl.classList.contains('green')).toBe(true);
    });
  });

  // 2. Host class composition
  describe('class composition', () => {
    describe('color', () => {
      it.each<DsButtonColor>(['green', 'orange', 'blue', 'red'])(
        'should apply "%s" color class',
        async (color) => {
          host.color.set(color);
          await fixture.whenStable();
          expect(buttonEl.classList.contains(color)).toBe(true);
        },
      );

      it('should remove previous color class when color changes', async () => {
        host.color.set('blue');
        await fixture.whenStable();
        expect(buttonEl.classList.contains('blue')).toBe(true);
        expect(buttonEl.classList.contains('green')).toBe(false);
      });
    });
  });

  // 3. Template rendering — action mode
  describe('template rendering (action)', () => {
    beforeEach(async () => {
      host.purposeType.set('action');
      await fixture.whenStable();
    });

    it('should project text content via ng-content', () => {
      const span = buttonEl.querySelector('span.body-md-semibold-fixed');
      expect(span).toBeTruthy();
      expect(span!.textContent!.trim()).toBe('Ghost Text');
    });

    it('should not render an icon when icon is null', () => {
      const otpSvg = buttonEl.querySelector('otp-svg');
      expect(otpSvg).toBeNull();
    });

    it('should render an icon when icon is set', async () => {
      host.icon.set('some-icon');
      await fixture.whenStable();
      const otpSvg = buttonEl.querySelector('otp-svg');
      expect(otpSvg).toBeTruthy();
    });

    it('should render the icon before the text content', async () => {
      host.icon.set('some-icon');
      await fixture.whenStable();
      const children = Array.from(buttonEl.children);
      const iconIndex = children.findIndex((el) => el.tagName === 'OTP-SVG');
      const spanIndex = children.findIndex((el) => el.tagName === 'SPAN');
      expect(iconIndex).toBeLessThan(spanIndex);
    });

    it('should not render navigation arrows in action mode', async () => {
      host.icon.set(null);
      await fixture.whenStable();
      const otpSvgs = buttonEl.querySelectorAll('otp-svg');
      expect(otpSvgs.length).toBe(0);
    });
  });

  // 4. Template rendering — navigation mode
  describe('template rendering (navigation)', () => {
    beforeEach(async () => {
      host.purposeType.set('navigation');
      await fixture.whenStable();
    });

    it('should render a direction arrow icon', () => {
      const otpSvg = buttonEl.querySelector('otp-svg');
      expect(otpSvg).toBeTruthy();
    });

    it('should render the arrow icon after text for non-left directions', async () => {
      host.direction.set('right');
      await fixture.whenStable();
      const children = Array.from(buttonEl.children);
      const spanIndex = children.findIndex((el) => el.tagName === 'SPAN');
      const iconIndex = children.findIndex((el) => el.tagName === 'OTP-SVG');
      expect(iconIndex).toBeGreaterThan(spanIndex);
    });

    it('should render the arrow icon before text for left direction', async () => {
      host.direction.set('left');
      await fixture.whenStable();
      const children = Array.from(buttonEl.children);
      const iconIndex = children.findIndex((el) => el.tagName === 'OTP-SVG');
      const spanIndex = children.findIndex((el) => el.tagName === 'SPAN');
      expect(iconIndex).toBeLessThan(spanIndex);
    });

    it.each<{ dir: 'up' | 'down' | 'left' | 'right'; expected: string }>([
      { dir: 'up', expected: 'OTP-icon-32x32-arrow-up' },
      { dir: 'down', expected: 'OTP-icon-32x32-arrow-down' },
      { dir: 'left', expected: 'OTP-icon-32x32-arrow-left' },
      { dir: 'right', expected: 'OTP-icon-32x32-arrow-right' },
    ])(
      'should use icon "$expected" for direction "$dir"',
      async ({ dir, expected }) => {
        host.direction.set(dir);
        await fixture.whenStable();
        const otpSvg = fixture.debugElement.query(
          (de) => de.nativeElement.tagName === 'OTP-SVG',
        );
        expect(otpSvg).toBeTruthy();
        expect(otpSvg.componentInstance.name()).toBe(expected);
      },
    );

    it('should render exactly one otp-svg for non-left directions', async () => {
      host.direction.set('right');
      await fixture.whenStable();
      const otpSvgs = buttonEl.querySelectorAll('otp-svg');
      expect(otpSvgs.length).toBe(1);
    });

    it('should render exactly one otp-svg for left direction', async () => {
      host.direction.set('left');
      await fixture.whenStable();
      const otpSvgs = buttonEl.querySelectorAll('otp-svg');
      expect(otpSvgs.length).toBe(1);
    });
  });

  // 5. Icon sizing
  describe('icon sizing', () => {
    it('should render action icons at 1rem', async () => {
      host.purposeType.set('action');
      host.icon.set('some-icon');
      await fixture.whenStable();
      const otpSvg = buttonEl.querySelector('otp-svg') as HTMLElement;
      expect(otpSvg.style.width).toBe('1rem');
      expect(otpSvg.style.height).toBe('1rem');
    });

    it('should render navigation icons at 1rem', async () => {
      host.purposeType.set('navigation');
      host.direction.set('right');
      await fixture.whenStable();
      const otpSvg = buttonEl.querySelector('otp-svg') as HTMLElement;
      expect(otpSvg.style.width).toBe('1rem');
      expect(otpSvg.style.height).toBe('1rem');
    });
  });

  // 6. Native button behavior
  describe('native button behavior', () => {
    it('should support disabled attribute', async () => {
      host.disabled.set(true);
      await fixture.whenStable();
      expect(buttonEl.disabled).toBe(true);
    });
  });

  // 7. Accessibility
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

  // 8. Click events
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
