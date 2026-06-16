import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  Injector,
  input,
  model,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ConnectedPosition, OverlayModule } from '@angular/cdk/overlay';
import { take } from 'rxjs';
import { SvgComponent } from '../svg/svg';
import { SvgNames } from '../svg/svg-names.enum';
import { ChipOption } from './chip-filter.types';

@Component({
  selector: 'otp-chip-filter',
  imports: [OverlayModule, SvgComponent],
  templateUrl: './chip-filter.component.html',
  styleUrl: './chip-filter.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChipFilterComponent<T> {
  private readonly destroyRef = inject(DestroyRef);
  private readonly injector = inject(Injector);
  private readonly triggerRef = viewChild.required<ElementRef<HTMLButtonElement>>('triggerBtn');

  readonly label = input.required<string>();
  readonly options = input.required<ChipOption<T>[]>();
  readonly multiselect = input(false);
  readonly disabled = input(false);

  value = model<ChipOption<T>[]>([]);

  protected readonly open = signal(false);
  protected readonly svgNames = SvgNames;
  protected readonly overlayPositions: ConnectedPosition[] = [
    { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top', offsetY: 8 },
    { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom', offsetY: -8 },
  ];

  protected readonly isActive = computed(() => this.value().some((o) => !o.isDefault));
  protected readonly chipLabel = computed(() => {
    const selected = this.value().filter((o) => !o.isDefault);
    if (!selected.length) return this.label();
    return selected.map((o) => o.label).join(', ');
  });
  protected readonly showReset = computed(() => this.multiselect() && this.isActive());

  protected onTriggerClick(): void {
    this.open.update((v) => !v);
  }

  protected onTriggerKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (!this.open()) {
        this.open.set(true);
        this.focusFirstOption();
      } else {
        this.close();
      }
    }
  }

  protected close(): void {
    this.open.set(false);
    this.triggerRef().nativeElement.focus();
  }

  protected onOverlayKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') { this.close(); return; }

    if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();

    const pane = (event.target as HTMLElement).closest('.cdk-overlay-pane');
    const opts = Array.from(pane?.querySelectorAll('[role="option"]') ?? []) as HTMLElement[];
    const idx = opts.indexOf(document.activeElement as HTMLElement);

    if (event.key === 'ArrowDown') opts[Math.min(idx + 1, opts.length - 1)]?.focus();
    else if (event.key === 'ArrowUp') opts[Math.max(idx - 1, 0)]?.focus();
    else if (event.key === 'Home') opts[0]?.focus();
    else if (event.key === 'End') opts[opts.length - 1]?.focus();
  }

  private focusFirstOption(): void {
    afterNextRender(() => {
      const pane = document.querySelector('.cdk-overlay-pane');
      (pane?.querySelector('[role="option"]') as HTMLElement | null)?.focus();
    }, { injector: this.injector });
  }

  protected onOptionClick(option: ChipOption<T>): void {
    if (option.selectHandler) {
      this.handleCustomOption(option);
      return;
    }
    this.toggleOption(option);
    if (!this.multiselect()) this.close();
  }

  protected onOptionKeydown(event: KeyboardEvent, option: ChipOption<T>): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.onOptionClick(option);
    }
  }

  protected isSelected(option: ChipOption<T>): boolean {
    if (option.selectHandler) return false;
    return this.value().some((v) => v.id === option.id);
  }

  protected onReset(): void {
    this.value.set([]);
  }

  private handleCustomOption(option: ChipOption<T>): void {
    const current = this.value().find((v) => v.id === option.id) ?? option;
    option
      .selectHandler!(current)
      .pipe(take(1), takeUntilDestroyed(this.destroyRef))
      .subscribe((result) => {
        if (result === null) return;
        this.upsertCustomOption(option, result.label, result.value);
        this.close();
      });
  }

  private upsertCustomOption(option: ChipOption<T>, label: string, value: T): void {
    const stored = { ...option, label, value };
    if (!this.multiselect()) {
      this.value.set([stored]);
      return;
    }
    const idx = this.value().findIndex((v) => v.id === option.id);
    if (idx > -1) {
      this.value.update((v) => v.map((o, i) => (i === idx ? stored : o)));
    } else {
      this.value.update((v) => [...v, stored]);
    }
  }

  private toggleOption(option: ChipOption<T>): void {
    const idx = this.value().findIndex((v) => v.id === option.id);
    if (idx > -1) {
      if (this.multiselect()) {
        this.value.update((v) => v.filter((_, i) => i !== idx));
      }
    } else if (this.multiselect()) {
      this.value.update((v) => [...v, option]);
    } else {
      this.value.set([option]);
    }
  }
}
