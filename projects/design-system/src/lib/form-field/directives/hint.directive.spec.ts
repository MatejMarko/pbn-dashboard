import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HintDirective } from './hint.directive';

@Component({
  template: `<otp-hint>Some hint text</otp-hint>`,
  imports: [HintDirective],
})
class NoIdHost {}

@Component({
  template: `<otp-hint id="my-custom-id">Some hint text</otp-hint>`,
  imports: [HintDirective],
})
class CustomIdHost {}

@Component({
  template: `
    <otp-hint>First hint</otp-hint>
    <otp-hint>Second hint</otp-hint>
  `,
  imports: [HintDirective],
})
class TwoHintsHost {}

describe('HintDirective', () => {
  describe('auto-generated id', () => {
    let fixture: ComponentFixture<NoIdHost>;
    let el: HTMLElement;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [NoIdHost],
      }).compileComponents();

      fixture = TestBed.createComponent(NoIdHost);
      fixture.detectChanges();
      el = fixture.nativeElement;
    });

    it('should set attr.id matching otp-hint-{n} pattern when no id is provided', () => {
      const hint = el.querySelector('otp-hint');
      expect(hint!.getAttribute('id')).toMatch(/^otp-hint-\d+$/);
    });
  });

  describe('custom id', () => {
    let fixture: ComponentFixture<CustomIdHost>;
    let el: HTMLElement;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [CustomIdHost],
      }).compileComponents();

      fixture = TestBed.createComponent(CustomIdHost);
      fixture.detectChanges();
      el = fixture.nativeElement;
    });

    it('should use the provided id attribute', () => {
      const hint = el.querySelector('otp-hint');
      expect(hint!.getAttribute('id')).toBe('my-custom-id');
    });

    it('should expose the provided id on the directive instance', () => {
      const debugEl = fixture.debugElement.query(
        (de) => de.nativeElement.tagName === 'OTP-HINT'
      );
      const directive = debugEl.injector.get(HintDirective);
      expect(directive.id).toBe('my-custom-id');
    });
  });

  describe('host binding', () => {
    let fixture: ComponentFixture<NoIdHost>;
    let el: HTMLElement;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [NoIdHost],
      }).compileComponents();

      fixture = TestBed.createComponent(NoIdHost);
      fixture.detectChanges();
      el = fixture.nativeElement;
    });

    it('should reflect directive id on the native element attr.id', () => {
      const debugEl = fixture.debugElement.query(
        (de) => de.nativeElement.tagName === 'OTP-HINT'
      );
      const directive = debugEl.injector.get(HintDirective);
      const hint = el.querySelector('otp-hint');
      expect(hint!.getAttribute('id')).toBe(directive.id);
    });
  });

  describe('id uniqueness', () => {
    let fixture: ComponentFixture<TwoHintsHost>;
    let el: HTMLElement;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [TwoHintsHost],
      }).compileComponents();

      fixture = TestBed.createComponent(TwoHintsHost);
      fixture.detectChanges();
      el = fixture.nativeElement;
    });

    it('should assign unique ids to multiple otp-hint instances', () => {
      const hints = el.querySelectorAll('otp-hint');
      expect(hints.length).toBe(2);
      const id0 = hints[0].getAttribute('id');
      const id1 = hints[1].getAttribute('id');
      expect(id0).not.toBe(id1);
    });
  });
});
