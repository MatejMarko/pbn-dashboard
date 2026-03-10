import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';

import { DsFormField } from './ds-form-field';
import { DsInput } from '../ds-input/ds-input';
import { DsLabel } from './directives/ds-label';
import { DsError } from './directives/ds-error';
import { DsHint } from './directives/ds-hint';
import { DsHintRight } from './directives/ds-hint-right';

@Component({
  template: `
    <ds-form-field>
      <ds-label>Username</ds-label>
      <input ds-input [formControl]="control" />
      <ds-error>This field is required</ds-error>
      <ds-hint>Enter your username</ds-hint>
      <ds-hint-right>0/50</ds-hint-right>
    </ds-form-field>
  `,
  imports: [DsFormField, DsInput, DsLabel, DsError, DsHint, DsHintRight, ReactiveFormsModule],
})
class FullFormFieldHost {
  control = new FormControl('', [Validators.required]);
}

@Component({
  template: `
    <ds-form-field>
      <ds-label>Optional</ds-label>
      <input ds-input [formControl]="control" />
      <ds-hint>A helpful hint</ds-hint>
    </ds-form-field>
  `,
  imports: [DsFormField, DsInput, DsLabel, DsHint, ReactiveFormsModule],
})
class NoValidationHost {
  control = new FormControl('');
}

@Component({
  template: `
    <ds-form-field>
      <ds-label>Disabled</ds-label>
      <input ds-input [formControl]="control" />
    </ds-form-field>
  `,
  imports: [DsFormField, DsInput, DsLabel, ReactiveFormsModule],
})
class DisabledHost {
  control = new FormControl({ value: 'test', disabled: true });
}

@Component({
  template: `
    <ds-form-field>
      <ds-label>With prefix/suffix</ds-label>
      <div ds-input-prefix>PREFIX</div>
      <input ds-input [formControl]="control" />
      <div ds-input-suffix>SUFFIX</div>
    </ds-form-field>
  `,
  imports: [DsFormField, DsInput, DsLabel, ReactiveFormsModule],
})
class PrefixSuffixHost {
  control = new FormControl('');
}

@Component({
  template: `<ds-form-field></ds-form-field>`,
  imports: [DsFormField],
})
class EmptyHost {}

@Component({
  template: `
    <ds-form-field>
      <input ds-input [formControl]="control" />
    </ds-form-field>
  `,
  imports: [DsFormField, DsInput, ReactiveFormsModule],
})
class NoLabelHost {
  control = new FormControl('');
}

describe('DsFormField', () => {

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

    it('should project ds-label', () => {
      const label = el.querySelector('ds-label');
      expect(label).toBeTruthy();
      expect(label!.textContent).toContain('Username');
    });

    it('should project ds-input', () => {
      const input = el.querySelector('input[ds-input]');
      expect(input).toBeTruthy();
    });

    it('should project ds-hint', () => {
      const hint = el.querySelector('ds-hint');
      expect(hint).toBeTruthy();
      expect(hint!.textContent).toContain('Enter your username');
    });

    it('should project ds-hint-right', () => {
      const hintRight = el.querySelector('ds-hint-right');
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
      const input = el.querySelector('input[ds-input]');
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
      expect(el.querySelector('.ds-error-wrapper')).toBeFalsy();
    });

    it('should show error when control is invalid and touched', () => {
      host.control.markAsTouched();
      fixture.detectChanges();

      expect(el.querySelector('.ds-error-wrapper')).toBeTruthy();
      expect(el.querySelector('.hint-wrapper')).toBeFalsy();
      expect(el.querySelector('ds-error')!.textContent).toContain('This field is required');
    });

    it('should switch back to hint when control becomes valid', () => {
      host.control.markAsTouched();
      fixture.detectChanges();
      expect(el.querySelector('.ds-error-wrapper')).toBeTruthy();

      host.control.setValue('valid value');
      fixture.detectChanges();
      expect(el.querySelector('.ds-error-wrapper')).toBeFalsy();
      expect(el.querySelector('.hint-wrapper')).toBeTruthy();
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
      const input = el.querySelector('input[ds-input]');
      const hint = el.querySelector('ds-hint');
      expect(input!.getAttribute('aria-describedby')).toBe(hint!.getAttribute('id'));
    });

    it('should point to error id when in error state', () => {
      host.control.markAsTouched();
      fixture.detectChanges();

      const input = el.querySelector('input[ds-input]');
      const error = el.querySelector('ds-error');
      expect(input!.getAttribute('aria-describedby')).toBe(error!.getAttribute('id'));
    });

    it('should switch back to hint id when error is resolved', () => {
      host.control.markAsTouched();
      fixture.detectChanges();

      host.control.setValue('valid');
      fixture.detectChanges();

      const input = el.querySelector('input[ds-input]');
      const hint = el.querySelector('ds-hint');
      expect(input!.getAttribute('aria-describedby')).toBe(hint!.getAttribute('id'));
    });
  });

  describe('host class binding', () => {
    it('should add ds-error-visible when in error state', async () => {
      const fixture = TestBed.configureTestingModule({
        imports: [FullFormFieldHost],
      }).createComponent(FullFormFieldHost);
      fixture.detectChanges();

      const formField = fixture.nativeElement.querySelector('ds-form-field');
      expect(formField.classList.contains('ds-error-visible')).toBe(false);

      fixture.componentInstance.control.markAsTouched();
      fixture.detectChanges();

      expect(formField.classList.contains('ds-error-visible')).toBe(true);
    });

    it('should add ds-disabled when control is disabled', async () => {
      const fixture = TestBed.configureTestingModule({
        imports: [DisabledHost],
      }).createComponent(DisabledHost);
      fixture.detectChanges();

      const formField = fixture.nativeElement.querySelector('ds-form-field');
      expect(formField.classList.contains('ds-disabled')).toBe(true);
    });

    it('should not have ds-disabled when control is enabled', async () => {
      const fixture = TestBed.configureTestingModule({
        imports: [FullFormFieldHost],
      }).createComponent(FullFormFieldHost);
      fixture.detectChanges();

      const formField = fixture.nativeElement.querySelector('ds-form-field');
      expect(formField.classList.contains('ds-disabled')).toBe(false);
    });
  });

  describe('dev mode warnings', () => {
    it('should warn when ds-input is missing', async () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const fixture = TestBed.configureTestingModule({
        imports: [EmptyHost],
      }).createComponent(EmptyHost);
      fixture.detectChanges();

      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Missing projected <input ds-input>')
      );
      warnSpy.mockRestore();
    });

    it('should warn when ds-label is missing', async () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const fixture = TestBed.configureTestingModule({
        imports: [NoLabelHost],
      }).createComponent(NoLabelHost);
      fixture.detectChanges();

      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Missing projected <ds-label>')
      );
      warnSpy.mockRestore();
    });

    it('should not warn when both ds-input and ds-label are present', async () => {
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
      const input = el.querySelector('input[ds-input]');
      expect(input!.getAttribute('aria-invalid')).toBe('false');
    });

    it('should set aria-invalid when invalid and touched', () => {
      host.control.markAsTouched();
      fixture.detectChanges();

      const input = el.querySelector('input[ds-input]');
      expect(input!.getAttribute('aria-invalid')).toBe('true');
    });
  });

  describe('aria-required', () => {
    it('should set aria-required when control has required validator', async () => {
      const fixture = TestBed.configureTestingModule({
        imports: [FullFormFieldHost],
      }).createComponent(FullFormFieldHost);
      fixture.detectChanges();

      const input = fixture.nativeElement.querySelector('input[ds-input]');
      expect(input!.getAttribute('aria-required')).toBe('true');
    });

    it('should not set aria-required when control has no required validator', async () => {
      const fixture = TestBed.configureTestingModule({
        imports: [NoValidationHost],
      }).createComponent(NoValidationHost);
      fixture.detectChanges();

      const input = fixture.nativeElement.querySelector('input[ds-input]');
      expect(input!.getAttribute('aria-required')).toBeNull();
    });
  });
});
