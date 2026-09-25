import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';

import { FormFieldComponent } from './form-field.component';
import { InputComponent } from '../input/input.component';
import { LabelDirective } from './directives/label.directive';
import { ErrorDirective } from './directives/error.directive';
import { HintDirective } from './directives/hint.directive';
import { HintRightDirective } from './directives/hint-right.directive';

@Component({
  template: `
    <otp-form-field>
      <otp-label>Username</otp-label>
      <input otp-input [formControl]="control" />
      <otp-error>This field is required</otp-error>
      <otp-hint>Enter your username</otp-hint>
      <otp-hint-right>0/50</otp-hint-right>
    </otp-form-field>
  `,
  imports: [FormFieldComponent, InputComponent, LabelDirective, ErrorDirective, HintDirective, HintRightDirective, ReactiveFormsModule],
})
class FullFormFieldHost {
  control = new FormControl('', [Validators.required]);
}

@Component({
  template: `
    <otp-form-field>
      <otp-label>Optional</otp-label>
      <input otp-input [formControl]="control" />
      <otp-hint>A helpful hint</otp-hint>
    </otp-form-field>
  `,
  imports: [FormFieldComponent, InputComponent, LabelDirective, HintDirective, ReactiveFormsModule],
})
class NoValidationHost {
  control = new FormControl('');
}

@Component({
  template: `
    <otp-form-field>
      <otp-label>Disabled</otp-label>
      <input otp-input [formControl]="control" />
    </otp-form-field>
  `,
  imports: [FormFieldComponent, InputComponent, LabelDirective, ReactiveFormsModule],
})
class DisabledHost {
  control = new FormControl({ value: 'test', disabled: true });
}

@Component({
  template: `
    <otp-form-field>
      <otp-label>With prefix/suffix</otp-label>
      <div otp-input-prefix>PREFIX</div>
      <input otp-input [formControl]="control" />
      <div otp-input-suffix>SUFFIX</div>
    </otp-form-field>
  `,
  imports: [FormFieldComponent, InputComponent, LabelDirective, ReactiveFormsModule],
})
class PrefixSuffixHost {
  control = new FormControl('');
}

@Component({
  template: `<otp-form-field></otp-form-field>`,
  imports: [FormFieldComponent],
})
class EmptyHost {}

@Component({
  template: `
    <otp-form-field>
      <input otp-input [formControl]="control" />
    </otp-form-field>
  `,
  imports: [FormFieldComponent, InputComponent, ReactiveFormsModule],
})
class NoLabelHost {
  control = new FormControl('');
}

describe('FormFieldComponent', () => {

  describe('content projection', () => {
    let fixture: ComponentFixture<FullFormFieldHost>;
    let el: HTMLElement;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [FullFormFieldHost],
      }).compileComponents();

      fixture = TestBed.createComponent(FullFormFieldHost);
      fixture.detectChanges();
      el = fixture.nativeElement;
    });

    it('should project otp-label', () => {
      const label = el.querySelector('otp-label');
      expect(label).toBeTruthy();
      expect(label!.textContent).toContain('Username');
    });

    it('should project otp-input', () => {
      const input = el.querySelector('input[otp-input]');
      expect(input).toBeTruthy();
    });

    it('should project otp-hint', () => {
      const hint = el.querySelector('otp-hint');
      expect(hint).toBeTruthy();
      expect(hint!.textContent).toContain('Enter your username');
    });

    it('should project otp-hint-right', () => {
      const hintRight = el.querySelector('otp-hint-right');
      expect(hintRight).toBeTruthy();
      expect(hintRight!.textContent).toContain('0/50');
    });
  });

  describe('prefix and suffix', () => {
    let fixture: ComponentFixture<PrefixSuffixHost>;
    let el: HTMLElement;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [PrefixSuffixHost],
      }).compileComponents();

      fixture = TestBed.createComponent(PrefixSuffixHost);
      fixture.detectChanges();
      el = fixture.nativeElement;
    });

    it('should project prefix and suffix inside input-wrapper', () => {
      const wrapper = el.querySelector('.input-wrapper');
      expect(wrapper!.textContent).toContain('PREFIX');
      expect(wrapper!.textContent).toContain('SUFFIX');
    });
  });

  describe('label-input linkage', () => {
    let fixture: ComponentFixture<FullFormFieldHost>;
    let el: HTMLElement;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [FullFormFieldHost],
      }).compileComponents();

      fixture = TestBed.createComponent(FullFormFieldHost);
      fixture.detectChanges();
      el = fixture.nativeElement;
    });

    it('should link label "for" to input "id"', () => {
      const label = el.querySelector('label');
      const input = el.querySelector('input[otp-input]');
      expect(label!.getAttribute('for')).toBe(input!.getAttribute('id'));
    });
  });

  describe('required indicator', () => {
    it('should show * when input has required validator', async () => {
      const fixture = TestBed.configureTestingModule({
        imports: [FullFormFieldHost],
      }).createComponent(FullFormFieldHost);
      fixture.detectChanges();

      const label = fixture.nativeElement.querySelector('label');
      expect(label!.textContent).toContain('*');
    });

    it('should not show * when input has no required validator', async () => {
      const fixture = TestBed.configureTestingModule({
        imports: [NoValidationHost],
      }).createComponent(NoValidationHost);
      fixture.detectChanges();

      const label = fixture.nativeElement.querySelector('label');
      expect(label!.textContent).not.toContain('*');
    });
  });

  describe('error vs hint toggle', () => {
    let fixture: ComponentFixture<FullFormFieldHost>;
    let host: FullFormFieldHost;
    let el: HTMLElement;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [FullFormFieldHost],
      }).compileComponents();

      fixture = TestBed.createComponent(FullFormFieldHost);
      host = fixture.componentInstance;
      fixture.detectChanges();
      el = fixture.nativeElement;
    });

    it('should show hint when control is untouched', () => {
      expect(el.querySelector('.hint-wrapper')).toBeTruthy();
      expect(el.querySelector('.error-wrapper')).toBeFalsy();
    });

    it('should show error when control is invalid and touched', () => {
      host.control.markAsTouched();
      fixture.detectChanges();

      expect(el.querySelector('.error-wrapper')).toBeTruthy();
      expect(el.querySelector('.hint-wrapper')).toBeFalsy();
      expect(el.querySelector('otp-error')!.textContent).toContain('This field is required');
    });

    it('should switch back to hint when control becomes valid', () => {
      host.control.markAsTouched();
      fixture.detectChanges();
      expect(el.querySelector('.error-wrapper')).toBeTruthy();

      host.control.setValue('valid value');
      fixture.detectChanges();
      expect(el.querySelector('.error-wrapper')).toBeFalsy();
      expect(el.querySelector('.hint-wrapper')).toBeTruthy();
    });
  });

  describe('error state without a projected message', () => {
    @Component({
      template: `
        <otp-form-field>
          <otp-label>Label</otp-label>
          <input otp-input [formControl]="control" />
        </otp-form-field>
      `,
      imports: [FormFieldComponent, InputComponent, LabelDirective, ReactiveFormsModule],
    })
    class NoErrorMessageHost {
      control = new FormControl('', Validators.required);
    }

    it('should not render the error icon when there is nothing to show', () => {
      const fixture = TestBed.configureTestingModule({
        imports: [NoErrorMessageHost],
      }).createComponent(NoErrorMessageHost);
      fixture.detectChanges();

      fixture.componentInstance.control.markAsTouched();
      fixture.detectChanges();

      const el: HTMLElement = fixture.nativeElement;
      // The field still styles itself as invalid...
      expect(el.querySelector('otp-form-field')!.classList).toContain('error-visible');
      // ...but shows no lone icon.
      expect(el.querySelector('.error-wrapper')).toBeFalsy();
      expect(el.querySelector('svg')).toBeFalsy();
    });
  });

  describe('aria-describedby sync', () => {
    let fixture: ComponentFixture<FullFormFieldHost>;
    let host: FullFormFieldHost;
    let el: HTMLElement;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [FullFormFieldHost],
      }).compileComponents();

      fixture = TestBed.createComponent(FullFormFieldHost);
      host = fixture.componentInstance;
      fixture.detectChanges();
      el = fixture.nativeElement;
    });

    it('should point to hint id when no error', () => {
      const input = el.querySelector('input[otp-input]');
      const hint = el.querySelector('otp-hint');
      expect(input!.getAttribute('aria-describedby')).toBe(hint!.getAttribute('id'));
    });

    it('should point to error id when in error state', () => {
      host.control.markAsTouched();
      fixture.detectChanges();

      const input = el.querySelector('input[otp-input]');
      const error = el.querySelector('otp-error');
      expect(input!.getAttribute('aria-describedby')).toBe(error!.getAttribute('id'));
    });

    it('should switch back to hint id when error is resolved', () => {
      host.control.markAsTouched();
      fixture.detectChanges();

      host.control.setValue('valid');
      fixture.detectChanges();

      const input = el.querySelector('input[otp-input]');
      const hint = el.querySelector('otp-hint');
      expect(input!.getAttribute('aria-describedby')).toBe(hint!.getAttribute('id'));
    });
  });

  describe('host class binding', () => {
    it('should add error-visible when in error state', async () => {
      const fixture = TestBed.configureTestingModule({
        imports: [FullFormFieldHost],
      }).createComponent(FullFormFieldHost);
      fixture.detectChanges();

      const formField = fixture.nativeElement.querySelector('otp-form-field');
      expect(formField.classList.contains('error-visible')).toBe(false);

      fixture.componentInstance.control.markAsTouched();
      fixture.detectChanges();

      expect(formField.classList.contains('error-visible')).toBe(true);
    });

    it('should add disabled when control is disabled', async () => {
      const fixture = TestBed.configureTestingModule({
        imports: [DisabledHost],
      }).createComponent(DisabledHost);
      fixture.detectChanges();

      const formField = fixture.nativeElement.querySelector('otp-form-field');
      expect(formField.classList.contains('disabled')).toBe(true);
    });

    it('should not have disabled when control is enabled', async () => {
      const fixture = TestBed.configureTestingModule({
        imports: [FullFormFieldHost],
      }).createComponent(FullFormFieldHost);
      fixture.detectChanges();

      const formField = fixture.nativeElement.querySelector('otp-form-field');
      expect(formField.classList.contains('disabled')).toBe(false);
    });
  });

  describe('dev mode warnings', () => {
    it('should warn when otp-input is missing', async () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const fixture = TestBed.configureTestingModule({
        imports: [EmptyHost],
      }).createComponent(EmptyHost);
      fixture.detectChanges();

      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Missing projected <input otp-input>')
      );
      warnSpy.mockRestore();
    });

    it('should warn when otp-label is missing', async () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const fixture = TestBed.configureTestingModule({
        imports: [NoLabelHost],
      }).createComponent(NoLabelHost);
      fixture.detectChanges();

      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Missing projected <otp-label>')
      );
      warnSpy.mockRestore();
    });

    it('should not warn when both otp-input and otp-label are present', async () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const fixture = TestBed.configureTestingModule({
        imports: [FullFormFieldHost],
      }).createComponent(FullFormFieldHost);
      fixture.detectChanges();

      expect(warnSpy).not.toHaveBeenCalled();
      warnSpy.mockRestore();
    });
  });

  describe('aria-invalid', () => {
    let fixture: ComponentFixture<FullFormFieldHost>;
    let host: FullFormFieldHost;
    let el: HTMLElement;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [FullFormFieldHost],
      }).compileComponents();

      fixture = TestBed.createComponent(FullFormFieldHost);
      host = fixture.componentInstance;
      fixture.detectChanges();
      el = fixture.nativeElement;
    });

    it('should not set aria-invalid when untouched', () => {
      const input = el.querySelector('input[otp-input]');
      expect(input!.getAttribute('aria-invalid')).toBe('false');
    });

    it('should set aria-invalid when invalid and touched', () => {
      host.control.markAsTouched();
      fixture.detectChanges();

      const input = el.querySelector('input[otp-input]');
      expect(input!.getAttribute('aria-invalid')).toBe('true');
    });
  });

  describe('aria-required', () => {
    it('should set aria-required when control has required validator', async () => {
      const fixture = TestBed.configureTestingModule({
        imports: [FullFormFieldHost],
      }).createComponent(FullFormFieldHost);
      fixture.detectChanges();

      const input = fixture.nativeElement.querySelector('input[otp-input]');
      expect(input!.getAttribute('aria-required')).toBe('true');
    });

    it('should not set aria-required when control has no required validator', async () => {
      const fixture = TestBed.configureTestingModule({
        imports: [NoValidationHost],
      }).createComponent(NoValidationHost);
      fixture.detectChanges();

      const input = fixture.nativeElement.querySelector('input[otp-input]');
      expect(input!.getAttribute('aria-required')).toBeNull();
    });
  });
});
