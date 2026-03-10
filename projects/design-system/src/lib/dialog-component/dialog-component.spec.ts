import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { DialogRef } from '@angular/cdk/dialog';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { DialogComponent } from './dialog-component';

@Component({
  template: `
    <lib-dialog-component [hasCloseIcon]="hasCloseIcon">
      <ng-container dialogTitle>Test Title</ng-container>
      <ng-container dialogDescription>Test Description</ng-container>
      <ng-container dialogActions>
        <button class="action-button">Confirm</button>
      </ng-container>
      <div dialogCustomContent class="custom-content">Custom content</div>
    </lib-dialog-component>
  `,
  standalone: true,
  imports: [DialogComponent],
})
class TestHostComponent {
  hasCloseIcon = false;
}

function setup(hasCloseIcon = false) {
  const dialogRefSpy = { close: vi.fn() };

  TestBed.configureTestingModule({
    imports: [TestHostComponent],
    providers: [
      { provide: DialogRef, useValue: dialogRefSpy },
      provideHttpClient(),
      provideHttpClientTesting(),
    ],
  });

  const fixture = TestBed.createComponent(TestHostComponent);
  fixture.componentInstance.hasCloseIcon = hasCloseIcon;
  fixture.detectChanges();

  return { fixture, dialogRefSpy };
}

describe('DialogComponent', () => {
  it('should create', () => {
    const { fixture } = setup();
    const dialogEl = fixture.nativeElement.querySelector('lib-dialog-component');
    expect(dialogEl).toBeTruthy();
  });

  describe('content projection', () => {
    it('should project the dialog title', () => {
      const { fixture } = setup();
      const title = fixture.nativeElement.querySelector('.heading-md');
      expect(title.textContent).toContain('Test Title');
    });

    it('should project the dialog description', () => {
      const { fixture } = setup();
      const description = fixture.nativeElement.querySelector('.body-md');
      expect(description.textContent).toContain('Test Description');
    });

    it('should project dialog actions', () => {
      const { fixture } = setup();
      const actions = fixture.nativeElement.querySelector('.dialog-actions-container');
      expect(actions.querySelector('.action-button')).toBeTruthy();
    });

    it('should project custom content', () => {
      const { fixture } = setup();
      const custom = fixture.nativeElement.querySelector('.custom-content');
      expect(custom).toBeTruthy();
      expect(custom.textContent).toContain('Custom content');
    });
  });

  describe('close icon', () => {
    it('should not render the close button when hasCloseIcon is false', () => {
      const { fixture } = setup(false);
      const closeButton = fixture.nativeElement.querySelector('.close-button-wrapper');
      expect(closeButton).toBeNull();
    });

    it('should render the close button when hasCloseIcon is true', () => {
      const { fixture } = setup(true);
      const closeButton = fixture.nativeElement.querySelector('.close-button-wrapper button');
      expect(closeButton).toBeTruthy();
    });

    it('should call dialogRef.close() when the close button is clicked', () => {
      const { fixture, dialogRefSpy } = setup(true);

      const closeButton: HTMLButtonElement = fixture.nativeElement.querySelector('.close-button-wrapper button');
      closeButton.click();

      expect(dialogRefSpy.close).toHaveBeenCalledOnce();
    });

    it('should have an accessible label on the close button', () => {
      const { fixture } = setup(true);

      const closeButton: HTMLButtonElement = fixture.nativeElement.querySelector('.close-button-wrapper button');
      expect(closeButton.getAttribute('aria-label')).toBe('Close the dialog');
    });
  });
});
