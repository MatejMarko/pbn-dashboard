import { TestBed } from '@angular/core/testing';
import { Component, TemplateRef, viewChild } from '@angular/core';
import { By } from '@angular/platform-browser';
import { CdkListboxModule } from '@angular/cdk/listbox';

import {
  DropdownBaseOption,
  DropdownMenuComponent,
  DropdownRowContext,
} from './dropdown-menu.component';
import { SvgNames } from '../svg/svg-names.enum';
import { provideMockSvg } from '../../test-utils/mock-svg';
import { OverlayContainer } from '@angular/cdk/overlay';

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

@Component({
  imports: [DropdownMenuComponent],
  providers: [provideMockSvg()],
  template: `
    <otp-dropdown-menu
      [options]="items"
      [selected]="selected"
      [openMode]="mode"
      (selectionChange)="onSelect($event)"
    >
      <button type="button">Select item</button>
    </otp-dropdown-menu>
  `,
})
class HostComponent {
  items: DropdownBaseOption<string>[] = [
    { icon: SvgNames.ACCOUNTS_24, title: 'Edit', description: 'Modify this item', value: 'edit' },
    {
      icon: SvgNames.ARROW_DOWN_16,
      title: 'Duplicate',
      description: 'Create a copy',
      value: 'duplicate',
    },
    {
      icon: SvgNames.CARDS_24,
      title: 'Archive',
      description: 'Move to archive',
      value: 'archive',
    },
  ];

  mode: 'click' | 'hover' = 'click';
  selected: string | null = null;

  onSelect(value: string | null) {
    this.selected = value;
  }
}

@Component({
  imports: [DropdownMenuComponent],
  providers: [provideMockSvg()],
  template: `
    <otp-dropdown-menu
      [options]="items"
      [selected]="selected"
      [rowTemplate]="customRow"
      (selectionChange)="onSelect($event)"
    >
      <button type="button">Select item</button>
    </otp-dropdown-menu>

    <ng-template #customRow let-option let-isSelected="selected">
      <span class="custom-title">{{ option.title }}</span>
      @if (isSelected) {
        <span class="custom-badge">Active</span>
      }
    </ng-template>
  `,
})
class CustomRowHostComponent {
  items: DropdownBaseOption<string>[] = [
    { title: 'Alpha', value: 'alpha' },
    { title: 'Beta', value: 'beta' },
  ];

  selected: string | null = 'alpha';

  customRowRef = viewChild<TemplateRef<DropdownRowContext<string>>>('customRow');

  onSelect(value: string | null) {
    this.selected = value;
  }
}

describe('DropdownMenuComponent', () => {
  function setup(initialMode: 'click' | 'hover' = 'click', selected: string | null = null) {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.componentInstance.mode = initialMode;
    fixture.componentInstance.selected = selected;
    fixture.detectChanges();
    return { fixture, host: fixture.componentInstance };
  }

  let overlayContainer: OverlayContainer;
  let overlayEl: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent, CustomRowHostComponent, CdkListboxModule],
    }).compileComponents();

    overlayContainer = TestBed.inject(OverlayContainer);
    overlayEl = overlayContainer.getContainerElement();
  });

  afterEach(() => {
    overlayEl.innerHTML = '';
  });

  it('renders projected trigger content', () => {
    const { fixture } = setup();

    const button = fixture.debugElement.query(By.css('button'));
    expect(button).toBeTruthy();
    expect(button.nativeElement.textContent).toContain('Select item');
  });

  it('opens on click in click mode', async () => {
    const { fixture } = setup();

    const button = fixture.debugElement.query(By.css('button')).nativeElement;
    button.click();
    fixture.detectChanges();

    await Promise.resolve();

    const panel = fixture.debugElement.query(By.css('.dropdown-panel'));
    expect(panel).toBeTruthy();
  });

  it('closes on click if already open', async () => {
    const { fixture } = setup();
    const button = fixture.debugElement.query(By.css('button')).nativeElement;

    button.click();
    fixture.detectChanges();
    await Promise.resolve();

    button.click();
    fixture.detectChanges();
    await Promise.resolve();

    const panel = fixture.debugElement.query(By.css('.dropdown-panel'));
    expect(panel).toBeFalsy();
  });

  it('opens on hover when mode="hover"', async () => {
    const { fixture } = setup('hover');
    const buttonEl = fixture.debugElement.query(By.css('button')).nativeElement as HTMLElement;

    buttonEl.dispatchEvent(new PointerEvent('pointerenter', { bubbles: true }));
    fixture.detectChanges();

    const child = fixture.debugElement.query(By.directive(DropdownMenuComponent));
    await delay(child.componentInstance.hoverOpenDelay());
    fixture.detectChanges();

    await Promise.resolve();
    await Promise.resolve();
    fixture.detectChanges();

    expect(fixture.debugElement.query(By.css('.dropdown-panel'))).toBeTruthy();
  });

  it('closes on hover leave (hover mode)', async () => {
    const { fixture } = setup('hover');
    const triggerHost = fixture.debugElement.query(By.css('.dropdown-trigger-host'));
    triggerHost.triggerEventHandler('pointerenter', {});
    const child = fixture.debugElement.query(By.directive(DropdownMenuComponent));
    await delay(child.componentInstance.hoverOpenDelay());
    fixture.detectChanges();

    triggerHost.triggerEventHandler('pointerleave', {});
    await delay(child.componentInstance.hoverCloseDelay());
    fixture.detectChanges();

    expect(fixture.debugElement.query(By.css('.dropdown-panel'))).toBeFalsy();
  });

  it('renders option title and description correctly', async () => {
    const { fixture } = setup();

    (fixture.debugElement.query(By.css('button')).nativeElement as HTMLButtonElement).click();
    fixture.detectChanges();

    await Promise.resolve();
    await Promise.resolve();

    const items = Array.from(overlayEl.querySelectorAll('li.dropdown-item'));
    expect(items.length).toBe(3);

    const expected = [
      { title: 'Edit', description: 'Modify this item' },
      { title: 'Duplicate', description: 'Create a copy' },
      { title: 'Archive', description: 'Move to archive' },
    ];

    items.forEach((li, i) => {
      const titleEl = li.querySelector('.dropdown-item-text') as HTMLElement | null;
      expect(titleEl).toBeTruthy();
      expect(titleEl!.textContent).toContain(expected[i].title);

      const descEl = li.querySelector('.dropdown-item-text') as HTMLElement | null;
      expect(descEl).toBeTruthy();
      expect(descEl!.textContent).toContain(expected[i].description);
    });
  });

  describe('selected option', () => {
    it('orderedOptions remain unchanged when no selected option is provided', () => {
      const { fixture } = setup();
      const compDe = fixture.debugElement.query(By.directive(DropdownMenuComponent));
      const comp = compDe.componentInstance as InstanceType<typeof DropdownMenuComponent<string>>;

      expect(comp.orderedOptions()).toEqual([
        {
          icon: SvgNames.ACCOUNTS_24,
          title: 'Edit',
          description: 'Modify this item',
          value: 'edit',
        },
        {
          icon: SvgNames.ARROW_DOWN_16,
          title: 'Duplicate',
          description: 'Create a copy',
          value: 'duplicate',
        },
        {
          icon: SvgNames.CARDS_24,
          title: 'Archive',
          description: 'Move to archive',
          value: 'archive',
        },
      ]);
    });

    it('moves the selected option to the front of orderedOptions', () => {
      const { fixture } = setup('click', 'duplicate');
      const compDe = fixture.debugElement.query(By.directive(DropdownMenuComponent));
      const comp = compDe.componentInstance as InstanceType<typeof DropdownMenuComponent<string>>;

      expect(comp.orderedOptions()).toEqual([
        {
          icon: SvgNames.ARROW_DOWN_16,
          title: 'Duplicate',
          description: 'Create a copy',
          value: 'duplicate',
        },
        {
          icon: SvgNames.ACCOUNTS_24,
          title: 'Edit',
          description: 'Modify this item',
          value: 'edit',
        },
        {
          icon: SvgNames.CARDS_24,
          title: 'Archive',
          description: 'Move to archive',
          value: 'archive',
        },
      ]);
    });

    it('keeps the original order when the selected value is not found', () => {
      const { fixture } = setup('click', 'missing');
      const compDe = fixture.debugElement.query(By.directive(DropdownMenuComponent));
      const comp = compDe.componentInstance as InstanceType<typeof DropdownMenuComponent<string>>;

      expect(comp.orderedOptions()).toEqual([
        {
          icon: SvgNames.ACCOUNTS_24,
          title: 'Edit',
          description: 'Modify this item',
          value: 'edit',
        },
        {
          icon: SvgNames.ARROW_DOWN_16,
          title: 'Duplicate',
          description: 'Create a copy',
          value: 'duplicate',
        },
        {
          icon: SvgNames.CARDS_24,
          title: 'Archive',
          description: 'Move to archive',
          value: 'archive',
        },
      ]);
    });
  });

  it('emits selected item', async () => {
    const { fixture, host } = setup();

    fixture.debugElement.query(By.css('button')).nativeElement.click();
    fixture.detectChanges();
    await Promise.resolve();

    const listItems = fixture.debugElement.queryAll(By.css('li'));

    listItems[1].nativeElement.click();
    fixture.detectChanges();
    await Promise.resolve();

    expect(host.selected).toEqual('duplicate');
  });

  it('sets aria attributes on trigger host', async () => {
    const { fixture } = setup();
    const child = fixture.debugElement.query(By.directive(DropdownMenuComponent));
    const comp = child.componentInstance as InstanceType<typeof DropdownMenuComponent<string>>;

    const triggerHost = fixture.debugElement.query(By.css('.dropdown-trigger-host'))
      .nativeElement as HTMLElement;
    expect(triggerHost.getAttribute('aria-expanded')).toBe('false');
    expect(triggerHost.getAttribute('aria-haspopup')).toBe('listbox');

    fixture.debugElement.query(By.css('button')).nativeElement.click();
    fixture.detectChanges();
    await Promise.resolve();

    expect(triggerHost.getAttribute('aria-expanded')).toBe('true');
    expect(triggerHost.getAttribute('aria-controls')).toBe(comp.listboxId);
  });

  it('returns focus to projected trigger on close', async () => {
    const { fixture } = setup();
    const compDe = fixture.debugElement.query(By.directive(DropdownMenuComponent));
    const comp = compDe.componentInstance as InstanceType<typeof DropdownMenuComponent<string>>;
    const button = fixture.debugElement.query(By.css('button')).nativeElement as HTMLButtonElement;

    button.click();
    fixture.detectChanges();
    await Promise.resolve();

    comp.close();
    fixture.detectChanges();
    await Promise.resolve();
    await Promise.resolve();

    expect(document.activeElement).toBe(button);
  });

  describe('custom rowTemplate', () => {
    function setupCustomRow() {
      const fixture = TestBed.createComponent(CustomRowHostComponent);
      fixture.detectChanges();
      return { fixture, host: fixture.componentInstance };
    }

    it('renders custom template instead of default layout', async () => {
      const { fixture } = setupCustomRow();

      fixture.debugElement.query(By.css('button')).nativeElement.click();
      fixture.detectChanges();
      await Promise.resolve();
      await Promise.resolve();

      const items = Array.from(overlayEl.querySelectorAll('li.dropdown-item'));
      expect(items.length).toBe(2);

      expect(items[0].querySelector('.custom-title')!.textContent).toBe('Alpha');
      expect(items[1].querySelector('.custom-title')!.textContent).toBe('Beta');
    });

    it('does not render default dropdown-item-text when custom template is used', async () => {
      const { fixture } = setupCustomRow();

      fixture.debugElement.query(By.css('button')).nativeElement.click();
      fixture.detectChanges();
      await Promise.resolve();

      expect(overlayEl.querySelector('.dropdown-item-text')).toBeNull();
    });

    it('passes selected state to custom template context', async () => {
      const { fixture } = setupCustomRow();

      fixture.debugElement.query(By.css('button')).nativeElement.click();
      fixture.detectChanges();
      await Promise.resolve();
      await Promise.resolve();

      const items = Array.from(overlayEl.querySelectorAll('li.dropdown-item'));
      expect(items[0].querySelector('.custom-badge')).toBeTruthy();
      expect(items[1].querySelector('.custom-badge')).toBeNull();
    });
  });
});
