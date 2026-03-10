import { TestBed } from '@angular/core/testing';
import { Dialog, DialogRef } from '@angular/cdk/dialog';
import { Component } from '@angular/core';

import { DsDialogCdkService } from './ds-dialog-cdk.service';
import { DsDialogCdkConfig } from './ds-dialog-cdk-config';

@Component({ template: '', standalone: true })
class TestDialogComponent {}

describe('DsDialogCdkService', () => {
  let service: DsDialogCdkService;
  let cdkDialogSpy: { open: ReturnType<typeof vi.fn> };
  let fakeDialogRef: Partial<DialogRef>;

  beforeEach(() => {
    fakeDialogRef = {} as Partial<DialogRef>;
    cdkDialogSpy = { open: vi.fn().mockReturnValue(fakeDialogRef) };

    TestBed.configureTestingModule({
      providers: [
        DsDialogCdkService,
        { provide: Dialog, useValue: cdkDialogSpy },
      ],
    });

    service = TestBed.inject(DsDialogCdkService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('open', () => {
    it('should apply default config when no config is provided', () => {
      service.open(TestDialogComponent);

      expect(cdkDialogSpy.open).toHaveBeenCalledWith(
        TestDialogComponent,
        expect.objectContaining({
          hasBackdrop: true,
          backdropClass: 'otp-dialog-backdrop',
          width: '30rem',
          maxWidth: '95vw',
          disableClose: false,
          autoFocus: 'first-tabbable',
          restoreFocus: true,
          dialogVariant: 'simple',
        }),
      );
    });

    it('should merge user config with defaults', () => {
      const config: DsDialogCdkConfig = { disableClose: true, width: '40rem' };

      service.open(TestDialogComponent, config);

      expect(cdkDialogSpy.open).toHaveBeenCalledWith(
        TestDialogComponent,
        expect.objectContaining({
          hasBackdrop: true,
          disableClose: true,
          width: '40rem',
        }),
      );
    });

    it('should let user config override all defaults', () => {
      const config: DsDialogCdkConfig = {
        hasBackdrop: false,
        backdropClass: 'custom-backdrop',
        width: '50rem',
        maxWidth: '80vw',
        disableClose: true,
        autoFocus: 'dialog',
        restoreFocus: false,
        dialogVariant: 'complex',
      };

      service.open(TestDialogComponent, config);

      const passedConfig = cdkDialogSpy.open.mock.calls[0][1];
      expect(passedConfig).toEqual(expect.objectContaining(config));
    });

    it('should set width to 30rem for simple variant when no width is provided', () => {
      const config: DsDialogCdkConfig = { dialogVariant: 'simple' };

      service.open(TestDialogComponent, config);

      const passedConfig = cdkDialogSpy.open.mock.calls[0][1];
      expect(passedConfig.width).toBe('30rem');
    });

    it('should set width to 37.5rem for complex variant when no width is provided', () => {
      const config: DsDialogCdkConfig = { dialogVariant: 'complex' };

      service.open(TestDialogComponent, config);

      const passedConfig = cdkDialogSpy.open.mock.calls[0][1];
      expect(passedConfig.width).toBe('37.5rem');
    });

    it('should not override width when explicitly provided alongside a variant', () => {
      const config: DsDialogCdkConfig = { dialogVariant: 'complex', width: '20rem' };

      service.open(TestDialogComponent, config);

      const passedConfig = cdkDialogSpy.open.mock.calls[0][1];
      expect(passedConfig.width).toBe('20rem');
    });

    it('should use default width when config is provided without variant or width', () => {
      const config: DsDialogCdkConfig = { disableClose: true };

      service.open(TestDialogComponent, config);

      const passedConfig = cdkDialogSpy.open.mock.calls[0][1];
      expect(passedConfig.width).toBe('30rem');
    });

    it('should return the DialogRef from CDK Dialog', () => {
      const result = service.open(TestDialogComponent);

      expect(result).toBe(fakeDialogRef);
    });
  });
});
