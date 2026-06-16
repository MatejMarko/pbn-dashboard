import { CdkListboxModule, ListboxValueChangeEvent } from '@angular/cdk/listbox';
import { ConnectedPosition, OverlayModule } from '@angular/cdk/overlay';
import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  input,
  OnDestroy,
  output,
  signal,
  TemplateRef,
  viewChild,
} from '@angular/core';
import { SvgComponent } from '../svg/svg';
import { SvgNames } from '../svg/svg-names.enum';

export interface DropdownBaseOption<V> {
  icon?: SvgNames;
  title: string;
  description?: string;
  value: V;
}

export interface DropdownRowContext<V> {
  $implicit: DropdownBaseOption<V>;
  selected: boolean;
}

@Component({
  selector: 'otp-dropdown-menu',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CdkListboxModule,
    NgTemplateOutlet,
    OverlayModule,
    SvgComponent,
  ],
  templateUrl: './dropdown-menu.component.html',
  styleUrl: './dropdown-menu.component.scss',
})
export class DropdownMenuComponent<V> implements OnDestroy {
  readonly options = input.required<readonly DropdownBaseOption<V>[]>();
  readonly selected = input<V>();
  readonly isReadonly = input(false);
  readonly disabled = input(false);

  readonly openMode = input<'hover' | 'click'>('click');
  readonly hoverOpenDelay = input(60);
  readonly hoverCloseDelay = input(140);
  readonly offsetY = input(12);

  readonly ariaLabel = input<string | null>(null);
  readonly ariaLabelledBy = input<string | null>(null);

  readonly rowTemplate = input<TemplateRef<DropdownRowContext<V>> | null>(null);

  readonly position = input<'left' | 'center' | 'right'>('right');

  readonly selectionChange = output<V>();

  private static uid = 0;
  readonly listboxId = `otp-dropdown-${++DropdownMenuComponent.uid}`;

  readonly triggerHost = viewChild<ElementRef<HTMLElement>>('triggerHost');
  readonly listboxElement = viewChild<ElementRef<HTMLElement>>('listboxRef');

  readonly open = signal(false);
  private openTimer?: number;
  private closeTimer?: number;

  readonly positions = computed<ConnectedPosition[]>(() => {
    const alignX =
      this.position() === 'left' ? 'end' : this.position() === 'center' ? 'center' : 'start';
    const offset = this.offsetY();
    return [
      { originX: alignX, originY: 'bottom', overlayX: alignX, overlayY: 'top', offsetY: offset },
      { originX: alignX, originY: 'top', overlayX: alignX, overlayY: 'bottom', offsetY: -offset },
    ];
  });

  readonly orderedOptions = computed(() => {
    const options = this.options();
    const selected = this.selected();

    if (selected == null) {
      return options;
    }

    const index = options.findIndex((o) => o.value === selected);

    if (index <= 0) {
      return options;
    }

    return [options[index], ...options.slice(0, index), ...options.slice(index + 1)];
  });

  close() {
    this.open.set(false);
    this.focusTriggerSoon();
  }

  onTriggerClick() {
    if (this.openMode() === 'click') {
      this.open.update((val) => !val);
    }
  }

  onTriggerEnter(): void {
    if (this.openMode() !== 'hover') return;
    clearTimeout(this.closeTimer);
    if (!this.open()) {
      clearTimeout(this.openTimer);
      this.openTimer = setTimeout(() => this.open.set(true), this.hoverOpenDelay());
    }
  }

  onTriggerLeave(): void {
    if (this.openMode() !== 'hover') return;
    clearTimeout(this.openTimer);
    clearTimeout(this.closeTimer);
    this.closeTimer = setTimeout(() => this.open.set(false), this.hoverCloseDelay());
  }

  onPanelEnter(): void {
    if (this.openMode() !== 'hover') return;
    clearTimeout(this.closeTimer);
  }

  onPanelLeave(): void {
    if (this.openMode() !== 'hover') return;
    clearTimeout(this.closeTimer);
    this.closeTimer = setTimeout(() => this.open.set(false), this.hoverCloseDelay());
  }

  onTriggerKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
      if (e.key === ' ') {
        e.preventDefault();
      }
      this.openViaKeyboard(e);
    }
  }

  openViaKeyboard(event: Event) {
    event.preventDefault();
    this.open.set(true);
    queueMicrotask(() => this.focusListboxSoon());
  }

  onListboxEscape(): void {
    this.close();
  }

  onSelect(ev: ListboxValueChangeEvent<unknown>) {
    const selected = ev.value[0] as V;
    this.selectionChange.emit(selected);
    this.close();
  }

  ngOnDestroy() {
    clearTimeout(this.closeTimer);
    clearTimeout(this.openTimer);
  }

  private focusListboxSoon(): void {
    queueMicrotask(() => this.listboxElement()?.nativeElement.focus());
  }

  private focusTriggerSoon(): void {
    queueMicrotask(() => {
      const host = this.triggerHost()?.nativeElement;
      const focusable =
        host?.querySelector<HTMLElement>('button, [tabindex], a, input, select');
      focusable?.focus();
    });
  }
}
