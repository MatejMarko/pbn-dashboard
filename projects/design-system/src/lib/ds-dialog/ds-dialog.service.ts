import { Injectable, Injector } from '@angular/core';
import { Overlay, OverlayConfig, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { ComponentType } from '@angular/cdk/overlay';
import { filter, takeUntil } from 'rxjs';

import { DsDialogConfig, DS_DIALOG_DATA } from './ds-dialog-config';
import { DsDialogRef } from './ds-dialog-ref';
import { DsDialogContainer } from './ds-dialog-container';

const DIALOG_DEFAULTS: DsDialogConfig = {
  disableClose: false,
  hasBackdrop: true,
  backdropClass: 'ds-dialog-backdrop',
  width: '500px',
  maxWidth: '90vw',
  autoFocus: true,
  restoreFocus: true,
};

let dialogCounter = 0;

@Injectable({ providedIn: 'root' })
export class DsDialogService {
  private readonly openDialogs: {
    ref: DsDialogRef<any>;
    overlayRef: OverlayRef;
    config: DsDialogConfig;
    previouslyFocused: Element | null;
  }[] = [];

  constructor(
    private readonly overlay: Overlay,
    private readonly injector: Injector,
  ) {}

  open<C, D = unknown, R = unknown>(
    component: ComponentType<C>,
    config?: DsDialogConfig<D>,
  ): DsDialogRef<R> {
    const mergedConfig = { ...DIALOG_DEFAULTS, ...config };

    // Store currently focused element for restoration
    const previouslyFocused = document.activeElement;

    // Create overlay
    const overlayRef = this.overlay.create(this.createOverlayConfig(mergedConfig));

    // Create dialog ref
    const dialogRef = new DsDialogRef<R>(`ds-dialog-${dialogCounter++}`);

    // Create injector with dialog data and ref
    const dialogInjector = Injector.create({
      parent: this.injector,
      providers: [
        { provide: DsDialogRef, useValue: dialogRef },
        { provide: DS_DIALOG_DATA, useValue: mergedConfig.data },
      ],
    });

    // Attach container
    const containerPortal = new ComponentPortal(DsDialogContainer, null, dialogInjector);
    const containerRef = overlayRef.attach(containerPortal);

    // Attach user component inside container
    const contentRef = containerRef.instance.contentViewContainer.createComponent(component, {
      injector: dialogInjector,
    });

    // Track in stack
    this.openDialogs.push({
      ref: dialogRef,
      overlayRef,
      config: mergedConfig,
      previouslyFocused,
    });

    // Handle close request from consumer
    dialogRef._onCloseRequest().subscribe(result => {
      this.closeDialog(dialogRef, result);
    });

    // Handle backdrop click
    if (!mergedConfig.disableClose) {
      overlayRef.backdropClick().pipe(
        takeUntil(dialogRef.afterClosed()),
      ).subscribe(() => {
        this.closeDialog(dialogRef);
      });
    }

    // Handle escape key
    overlayRef.keydownEvents().pipe(
      filter(event => event.key === 'Escape'),
      takeUntil(dialogRef.afterClosed()),
    ).subscribe(event => {
      event.preventDefault();
      if (!mergedConfig.disableClose) {
        this.closeDialog(dialogRef);
      }
    });

    return dialogRef;
  }

  /** Close all open dialogs (top to bottom) */
  closeAll(): void {
    [...this.openDialogs].reverse().forEach(entry => {
      this.closeDialog(entry.ref);
    });
  }

  private closeDialog<R>(dialogRef: DsDialogRef<R>, result?: R): void {
    const index = this.openDialogs.findIndex(d => d.ref === dialogRef);
    if (index === -1) return;

    const entry = this.openDialogs[index];

    // Remove from stack
    this.openDialogs.splice(index, 1);

    // Dispose overlay
    entry.overlayRef.dispose();

    // Restore focus
    if (entry.config.restoreFocus && entry.previouslyFocused instanceof HTMLElement) {
      entry.previouslyFocused.focus();
    }

    // Notify subscribers
    dialogRef._finalize(result);
  }

  private createOverlayConfig(config: DsDialogConfig): OverlayConfig {
    return new OverlayConfig({
      hasBackdrop: config.hasBackdrop,
      backdropClass: config.backdropClass,
      panelClass: config.panelClass as string | string[] | undefined,
      width: config.width,
      maxWidth: config.maxWidth,
      height: config.height,
      positionStrategy: this.overlay.position()
        .global()
        .centerHorizontally()
        .centerVertically(),
      scrollStrategy: this.overlay.scrollStrategies.block(),
    });
  }
}
