import {
  Component,
  ViewChild,
  ViewContainerRef,
  AfterViewInit,
  OnDestroy,
  HostBinding,
} from '@angular/core';
import { ConfigurableFocusTrapFactory, FocusTrap } from '@angular/cdk/a11y';

@Component({
  selector: 'ds-dialog-container',
  templateUrl: './ds-dialog-container.html',
  styleUrl: './ds-dialog-container.scss',
})
export class DsDialogContainer implements AfterViewInit, OnDestroy {
  @ViewChild('dialogContent', { read: ViewContainerRef, static: true })
  contentViewContainer!: ViewContainerRef;

  @HostBinding('attr.role') role = 'dialog';
  @HostBinding('attr.aria-modal') ariaModal = 'true';

  private focusTrap!: FocusTrap;

  constructor(private readonly focusTrapFactory: ConfigurableFocusTrapFactory) {}

  ngAfterViewInit(): void {
    this.focusTrap = this.focusTrapFactory.create(
      this.contentViewContainer.element.nativeElement.parentElement,
    );
    this.focusTrap.focusInitialElementWhenReady();
  }

  ngOnDestroy(): void {
    this.focusTrap?.destroy();
  }
}
