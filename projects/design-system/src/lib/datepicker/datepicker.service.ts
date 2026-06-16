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

export interface DatepickerConfig {
  origin: ElementRef | HTMLElement;
  selected?: Date | null;
  min?: Date | null;
  max?: Date | null;
  fixedWeeks?: boolean;
}

const POSITIONS: ConnectedPosition[] = [
  { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top', offsetY: 4 },
  { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom', offsetY: -4 },
  { originX: 'end', originY: 'bottom', overlayX: 'end', overlayY: 'top', offsetY: 4 },
  { originX: 'end', originY: 'top', overlayX: 'end', overlayY: 'bottom', offsetY: -4 },
];

@Injectable({ providedIn: 'root' })
export class DatepickerService {
  private readonly overlay = inject(Overlay);
  private readonly injector = inject(Injector);

  open(config: DatepickerConfig): DatepickerRef {
    const origin = config.origin instanceof ElementRef ? config.origin.nativeElement : config.origin;

    const positionStrategy: FlexibleConnectedPositionStrategy = this.overlay
      .position()
      .flexibleConnectedTo(origin)
      .withPositions(POSITIONS)
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

    overlayRef.backdropClick().subscribe(() => datepickerRef.close(null));

    // Focus the initial day cell after rendering
    queueMicrotask(() => componentRef.instance.focusInitial());

    return datepickerRef;
  }
}
