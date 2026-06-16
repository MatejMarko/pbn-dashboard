import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ErrorDirective } from './error.directive';

@Component({
  template: `<otp-error>Some error text</otp-error>`,
  imports: [ErrorDirective],
})
class NoIdHost {}

@Component({
  template: `<otp-error id="my-custom-id">Some error text</otp-error>`,
  imports: [ErrorDirective],
})
class CustomIdHost {}

/*



*/

@Component({
  template: `
    <otp-error>First error</otp-error>
    <otp-error>Second error</otp-error>
  `,
  imports: [ErrorDirective],
})
class TwoErrorsHost {}

describe('ErrorDirective', () => {
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

    it('should set attr.id matching otp-error-{n} pattern when no id is provided', () => {
      const error = el.querySelector('otp-error');
      expect(error!.getAttribute('id')).toMatch(/^otp-error-\d+$/);
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
      const error = el.querySelector('otp-error');
      expect(error!.getAttribute('id')).toBe('my-custom-id');
    });

    it('should expose the provided id on the directive instance', () => {
      const debugEl = fixture.debugElement.query(
        (de) => de.nativeElement.tagName === 'OTP-ERROR'
      );
      const directive = debugEl.injector.get(ErrorDirective);
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
        (de) => de.nativeElement.tagName === 'OTP-ERROR'
      );
      const directive = debugEl.injector.get(ErrorDirective);
      const error = el.querySelector('otp-error');
      expect(error!.getAttribute('id')).toBe(directive.id);
    });
  });

  describe('id uniqueness', () => {
    let fixture: ComponentFixture<TwoErrorsHost>;
    let el: HTMLElement;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [TwoErrorsHost],
      }).compileComponents();

      fixture = TestBed.createComponent(TwoErrorsHost);
      fixture.detectChanges();
      el = fixture.nativeElement;
    });

    it('should assign unique ids to multiple otp-error instances', () => {
      const errors = el.querySelectorAll('otp-error');
      expect(errors.length).toBe(2);
      const id0 = errors[0].getAttribute('id');
      const id1 = errors[1].getAttribute('id');
      expect(id0).not.toBe(id1);
    });
  });
});
