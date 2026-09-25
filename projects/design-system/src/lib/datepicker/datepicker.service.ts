import { ElementRef, inject, Injectable, Injector, signal } from '@angular/core';
import { ComponentPortal } from '@angular/cdk/portal';
import {
  Overlay,
  OverlayConfig,
  FlexibleConnectedPositionStrategy,
  ConnectedPosition,
} from '@angular/cdk/overlay';
import { DATEPICKER_DATA, DatepickerData } from './datepicker-context';
import { DatepickerPanelComponent } from './panel/datepicker-panel.component';
import { DatepickerRef } from './datepicker-ref';

/**
 * What the overlay is anchored to:
 * - `trigger`: the element that opens the calendar (usually the suffix icon).
 *   The caret then lands on it whatever the field's size.
 * - `field`: the form field itself, used when no trigger is registered.
 */
export type DatepickerAnchor = 'trigger' | 'field';

export interface DatepickerConfig {
  origin: ElementRef | HTMLElement;
  anchor?: DatepickerAnchor;
  selected?: Date | null;
  min?: Date | null;
  max?: Date | null;
  fixedWeeks?: boolean;
}

/**
 * Distance from the panel's right edge to the caret's tip. The panel is placed
 * so this point sits on the trigger, which keeps the caret aimed at it no
 * matter how wide or tall the field is. Must match `--otp-datepicker-caret-inset`.
 */
const CARET_INSET_REM = 3.625;
/** Gap between the trigger and the panel when it opens below. */
const TRIGGER_GAP_REM = 1.125;
/** Gap when the panel has to open above; no caret is shown there. */
const ABOVE_GAP_REM = 0.625;
/** Overhang past the field's right edge when there is no trigger to aim at. */
const FIELD_OVERHANG_REM = 1.875;

function remToPx(rem: number): number {
  const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
  return rem * (isNaN(rootFontSize) ? 16 : rootFontSize);
}

function buildPositions(anchor: DatepickerAnchor): ConnectedPosition[] {
  const below = remToPx(TRIGGER_GAP_REM);
  const above = -remToPx(ABOVE_GAP_REM);

  if (anchor === 'trigger') {
    // The overlay's right edge sits `caret inset` to the right of the trigger's
    // centre, so the caret's tip lands exactly on the trigger.
    const offsetX = remToPx(CARET_INSET_REM);
    return [
      { originX: 'center', originY: 'bottom', overlayX: 'end', overlayY: 'top', offsetX, offsetY: below },
      { originX: 'center', originY: 'top', overlayX: 'end', overlayY: 'bottom', offsetX, offsetY: above },
    ];
  }

  const offsetX = remToPx(FIELD_OVERHANG_REM);
  return [
    { originX: 'end', originY: 'bottom', overlayX: 'end', overlayY: 'top', offsetX, offsetY: below },
    { originX: 'end', originY: 'top', overlayX: 'end', overlayY: 'bottom', offsetX, offsetY: above },
  ];
}

@Injectable({ providedIn: 'root' })
export class DatepickerService {
  private readonly overlay = inject(Overlay);
  private readonly injector = inject(Injector);

  open(config: DatepickerConfig): DatepickerRef {
    const origin = config.origin instanceof ElementRef ? config.origin.nativeElement : config.origin;

    const positionStrategy: FlexibleConnectedPositionStrategy = this.overlay
      .position()
      .flexibleConnectedTo(origin)
      .withPositions(buildPositions(config.anchor ?? 'field'))
      .withPush(true);

    const overlayConfig = new OverlayConfig({
      positionStrategy,
      scrollStrategy: this.overlay.scrollStrategies.reposition(),
      hasBackdrop: true,
      backdropClass: 'cdk-overlay-transparent-backdrop',
    });

    const overlayRef = this.overlay.create(overlayConfig);
    const datepickerRef = new DatepickerRef(overlayRef);

    const data: DatepickerData = {
      selected: signal(config.selected ?? null),
      min: signal(config.min ?? null),
      max: signal(config.max ?? null),
      fixedWeeks: signal(config.fixedWeeks ?? true),
      close: (date: Date | null) => {
        datepickerRef.close(date);
        origin.focus();
      },
    };

    const injector = Injector.create({
      parent: this.injector,
      providers: [{ provide: DATEPICKER_DATA, useValue: data }],
    });

    const portal = new ComponentPortal(DatepickerPanelComponent, null, injector);
    const componentRef = overlayRef.attach(portal);

    // The caret only makes sense when the panel opens below its trigger.
    positionStrategy.positionChanges.subscribe(change => {
      componentRef.instance.placement.set(
        change.connectionPair.originY === 'bottom' ? 'below' : 'above'
      );
    });

    overlayRef.backdropClick().subscribe(() => datepickerRef.close(null));

    // Focus the initial day cell after rendering
    queueMicrotask(() => componentRef.instance.focusInitial());

    return datepickerRef;
  }
}
