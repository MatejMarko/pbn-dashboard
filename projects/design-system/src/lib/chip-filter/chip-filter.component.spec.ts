import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OverlayContainer } from '@angular/cdk/overlay';
import { EMPTY, of } from 'rxjs';
import { ChipFilterComponent } from './chip-filter.component';
import { ChipOption } from './chip-filter.types';
import { Svg } from '../svg';

const mockSvg = { getImage: () => EMPTY };

const OPTIONS: ChipOption<string>[] = [
  { id: 'a', label: 'Option A', value: 'a' },
  { id: 'b', label: 'Option B', value: 'b' },
  { id: 'c', label: 'Option C', value: 'c' },
];

const OPTIONS_WITH_DEFAULT: ChipOption<string>[] = [
  { id: 'all', label: 'All', value: 'all', isDefault: true },
  { id: 'a', label: 'Option A', value: 'a' },
  { id: 'b', label: 'Option B', value: 'b' },
];

@Component({
  template: `
    <otp-chip-filter
      label="Filter"
      [options]="options()"
      [multiselect]="multiselect()"
      [disabled]="disabled()"
      [(value)]="value"
    />
  `,
  imports: [ChipFilterComponent],
})
class TestHost {
  options = signal<ChipOption<string>[]>([...OPTIONS]);
  multiselect = signal(false);
  disabled = signal(false);
  value = signal<ChipOption<string>[]>([]);
}

@Component({
  template: `
    <otp-chip-filter
      label="Filter"
      [options]="options"
      [(value)]="value"
    />
  `,
  imports: [ChipFilterComponent],
})
class CustomOptionHost {
  options: ChipOption<string | null>[] = [];
  value = signal<ChipOption<string | null>[]>([]);
}

describe('ChipFilterComponent', () => {
  let fixture: ComponentFixture<TestHost>;
  let host: TestHost;
  let el: HTMLElement;
  let overlayEl: HTMLElement;

  const chip = () => el.querySelector('button.chip') as HTMLButtonElement;
  const panel = () => overlayEl.querySelector('.panel') as HTMLElement | null;
  const options = () => Array.from(overlayEl.querySelectorAll('.panel__option')) as HTMLElement[];
  const open = () => { chip().click(); fixture.detectChanges(); };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHost],
      providers: [{ provide: Svg, useValue: mockSvg }],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHost);
    host = fixture.componentInstance;
    el = fixture.nativeElement;
    overlayEl = TestBed.inject(OverlayContainer).getContainerElement();
    fixture.detectChanges();
  });

  describe('chip label', () => {
    it('shows the default label when nothing is selected', () => {
      expect(chip().textContent).toContain('Filter');
    });

    it('shows the selected option label for single select', () => {
      host.value.set([OPTIONS[0]]);
      fixture.detectChanges();
      expect(chip().textContent).toContain('Option A');
    });

    it('joins selected labels with comma for multi select', () => {
      host.multiselect.set(true);
      host.value.set([OPTIONS[0], OPTIONS[1]]);
      fixture.detectChanges();
      expect(chip().textContent).toContain('Option A, Option B');
    });

    it('shows default label when only an isDefault option is selected', () => {
      host.options.set([...OPTIONS_WITH_DEFAULT]);
      host.value.set([OPTIONS_WITH_DEFAULT[0]]);
      fixture.detectChanges();
      expect(chip().textContent).toContain('Filter');
    });

    it('shows non-default label when isDefault and non-default are both selected', () => {
      host.multiselect.set(true);
      host.options.set([...OPTIONS_WITH_DEFAULT]);
      host.value.set([OPTIONS_WITH_DEFAULT[0], OPTIONS_WITH_DEFAULT[1]]);
      fixture.detectChanges();
      expect(chip().textContent).toContain('Option A');
      expect(chip().textContent).not.toContain('All');
    });
  });

  describe('active state', () => {
    it('is not active when nothing is selected', () => {
      expect(chip().classList.contains('chip--active')).toBe(false);
    });

    it('is active when a non-default option is selected', () => {
      host.value.set([OPTIONS[0]]);
      fixture.detectChanges();
      expect(chip().classList.contains('chip--active')).toBe(true);
    });

    it('is not active when only an isDefault option is selected', () => {
      host.options.set([...OPTIONS_WITH_DEFAULT]);
      host.value.set([OPTIONS_WITH_DEFAULT[0]]);
      fixture.detectChanges();
      expect(chip().classList.contains('chip--active')).toBe(false);
    });
  });

  describe('aria attributes', () => {
    it('sets aria-haspopup="listbox" on the trigger', () => {
      expect(chip().getAttribute('aria-haspopup')).toBe('listbox');
    });

    it('sets aria-expanded="false" when closed', () => {
      expect(chip().getAttribute('aria-expanded')).toBe('false');
    });

    it('sets aria-expanded="true" when open', () => {
      open();
      expect(chip().getAttribute('aria-expanded')).toBe('true');
    });
  });

  describe('dropdown', () => {
    it('opens on click', () => {
      open();
      expect(panel()).toBeTruthy();
    });

    it('closes on second click', () => {
      open();
      chip().click();
      fixture.detectChanges();
      expect(panel()).toBeFalsy();
    });

    it('renders all available options', () => {
      open();
      expect(options().length).toBe(OPTIONS.length);
    });

    it('renders option labels', () => {
      open();
      const labels = options().map(o => o.textContent?.trim());
      expect(labels).toContain('Option A');
      expect(labels).toContain('Option B');
    });
  });

  describe('single select', () => {
    it('clicking an option updates the value', () => {
      open();
      options()[0].click();
      fixture.detectChanges();
      expect(host.value()).toEqual([OPTIONS[0]]);
    });

    it('clicking an option closes the dropdown', () => {
      open();
      options()[0].click();
      fixture.detectChanges();
      expect(panel()).toBeFalsy();
    });

    it('clicking a different option replaces the current value', () => {
      host.value.set([OPTIONS[0]]);
      fixture.detectChanges();
      open();
      options()[1].click();
      fixture.detectChanges();
      expect(host.value()).toEqual([OPTIONS[1]]);
    });

    it('re-clicking the selected option is a no-op', () => {
      host.value.set([OPTIONS[0]]);
      fixture.detectChanges();
      open();
      options()[0].click();
      fixture.detectChanges();
      expect(host.value()).toEqual([OPTIONS[0]]);
    });

    it('closes the dropdown even when re-clicking the selected option', () => {
      host.value.set([OPTIONS[0]]);
      fixture.detectChanges();
      open();
      options()[0].click();
      fixture.detectChanges();
      expect(panel()).toBeFalsy();
    });

    it('uses role="option" on options', () => {
      open();
      options().forEach(o => expect(o.getAttribute('role')).toBe('option'));
    });

    it('sets aria-selected="false" on unselected options', () => {
      open();
      options().forEach(o => expect(o.getAttribute('aria-selected')).toBe('false'));
    });

    it('sets aria-selected="true" on the selected option', () => {
      host.value.set([OPTIONS[1]]);
      fixture.detectChanges();
      open();
      expect(options()[1].getAttribute('aria-selected')).toBe('true');
      expect(options()[0].getAttribute('aria-selected')).toBe('false');
    });

    it('applies selected class to the active option', () => {
      host.value.set([OPTIONS[1]]);
      fixture.detectChanges();
      open();
      expect(options()[1].classList.contains('panel__option--selected')).toBe(true);
      expect(options()[0].classList.contains('panel__option--selected')).toBe(false);
    });
  });

  describe('multi select', () => {
    beforeEach(() => {
      host.multiselect.set(true);
      fixture.detectChanges();
    });

    it('clicking an option adds it to the value', () => {
      open();
      options()[0].click();
      fixture.detectChanges();
      expect(host.value()).toEqual([OPTIONS[0]]);
    });

    it('dropdown stays open after selecting an option', () => {
      open();
      options()[0].click();
      fixture.detectChanges();
      expect(panel()).toBeTruthy();
    });

    it('can select multiple options', () => {
      open();
      options()[0].click();
      fixture.detectChanges();
      options()[1].click();
      fixture.detectChanges();
      expect(host.value()).toEqual([OPTIONS[0], OPTIONS[1]]);
    });

    it('re-clicking a selected option removes it', () => {
      host.value.set([OPTIONS[0]]);
      fixture.detectChanges();
      open();
      options()[0].click();
      fixture.detectChanges();
      expect(host.value()).toEqual([]);
    });

    it('uses role="option" on options', () => {
      open();
      options().forEach(o => expect(o.getAttribute('role')).toBe('option'));
    });

    it('sets aria-selected="true" on selected options', () => {
      host.value.set([OPTIONS[0]]);
      fixture.detectChanges();
      open();
      expect(options()[0].getAttribute('aria-selected')).toBe('true');
    });

    it('sets aria-selected="false" on unselected options', () => {
      open();
      expect(options()[0].getAttribute('aria-selected')).toBe('false');
    });

    it('shows the reset button when at least one option is selected', () => {
      host.value.set([OPTIONS[0]]);
      fixture.detectChanges();
      open();
      expect(overlayEl.querySelector('.panel__reset-btn')).toBeTruthy();
    });

    it('does not show the reset button when nothing is selected', () => {
      open();
      expect(overlayEl.querySelector('.panel__reset-btn')).toBeFalsy();
    });

    it('reset button clears all selected options', () => {
      host.value.set([OPTIONS[0], OPTIONS[1]]);
      fixture.detectChanges();
      open();
      (overlayEl.querySelector('.panel__reset-btn') as HTMLButtonElement).click();
      fixture.detectChanges();
      expect(host.value()).toEqual([]);
    });
  });

  describe('isDefault options', () => {
    beforeEach(() => {
      host.options.set([...OPTIONS_WITH_DEFAULT]);
      fixture.detectChanges();
    });

    it('applies selected class to the isDefault option when it is selected', () => {
      host.value.set([OPTIONS_WITH_DEFAULT[0]]);
      fixture.detectChanges();
      open();
      expect(options()[0].classList.contains('panel__option--selected')).toBe(true);
    });

    it('chip is not active when only the isDefault option is selected', () => {
      host.value.set([OPTIONS_WITH_DEFAULT[0]]);
      fixture.detectChanges();
      expect(chip().classList.contains('chip--active')).toBe(false);
    });

    it('chip becomes active when a non-default option is also selected', () => {
      host.multiselect.set(true);
      host.value.set([OPTIONS_WITH_DEFAULT[0], OPTIONS_WITH_DEFAULT[1]]);
      fixture.detectChanges();
      expect(chip().classList.contains('chip--active')).toBe(true);
    });
  });

  describe('disabled', () => {
    beforeEach(() => {
      host.disabled.set(true);
      fixture.detectChanges();
    });

    it('the button has the disabled attribute', () => {
      expect(chip().disabled).toBe(true);
    });

    it('does not open the dropdown on click', () => {
      chip().click();
      fixture.detectChanges();
      expect(panel()).toBeFalsy();
    });
  });

  describe('selectHandler', () => {
    let customFixture: ComponentFixture<CustomOptionHost>;
    let customHost: CustomOptionHost;
    let customEl: HTMLElement;

    const customChip = () => customEl.querySelector('button.chip') as HTMLButtonElement;
    const customOptions = () => Array.from(overlayEl.querySelectorAll('.panel__option')) as HTMLElement[];
    const customOpen = () => { customChip().click(); customFixture.detectChanges(); };

    beforeEach(async () => {
      customFixture = TestBed.createComponent(CustomOptionHost);
      customHost = customFixture.componentInstance;
      customEl = customFixture.nativeElement;
    });

    it('calls selectHandler instead of toggling when a custom option is clicked', () => {
      const handler = vi.fn().mockReturnValue(EMPTY);
      customHost.options = [{ id: 'custom', label: 'Custom', value: null, selectHandler: handler }];
      customFixture.detectChanges();
      customOpen();
      customOptions()[0].click();
      customFixture.detectChanges();
      expect(handler).toHaveBeenCalledOnce();
    });

    it('updates the option label and value when handler returns a result', () => {
      customHost.options = [{
        id: 'custom', label: 'Custom', value: null,
        selectHandler: () => of({ label: 'Result label', value: 'result-value' }),
      }];
      customFixture.detectChanges();
      customOpen();
      customOptions()[0].click();
      customFixture.detectChanges();
      expect(customHost.value()[0]?.label).toBe('Result label');
      expect(customHost.value()[0]?.value).toBe('result-value');
    });

    it('does not update value when handler returns null (cancel)', () => {
      customHost.options = [{
        id: 'custom', label: 'Custom', value: null,
        selectHandler: () => of(null),
      }];
      customFixture.detectChanges();
      customOpen();
      customOptions()[0].click();
      customFixture.detectChanges();
      expect(customHost.value()).toEqual([]);
    });

    it('does not highlight a custom option as selected in the dropdown', () => {
      customHost.options = [{
        id: 'custom', label: 'Custom', value: null,
        selectHandler: () => of({ label: 'Result', value: null }),
      }];
      customHost.value.set([{ id: 'custom', label: 'Result', value: null }]);
      customFixture.detectChanges();
      customOpen();
      expect(customOptions()[0].classList.contains('panel__option--selected')).toBe(false);
    });

    it('replaces a previously selected normal option when a custom option is confirmed', () => {
      const normalOption: ChipOption<string | null> = { id: 'normal', label: 'Normal', value: 'normal' };
      const customOption: ChipOption<string | null> = {
        id: 'custom', label: 'Custom', value: null,
        selectHandler: () => of({ label: 'Custom result', value: null }),
      };
      customHost.options = [normalOption, customOption];
      customHost.value.set([normalOption]);
      customFixture.detectChanges();
      customOpen();
      customOptions()[1].click();
      customFixture.detectChanges();
      expect(customHost.value().length).toBe(1);
      expect(customHost.value()[0].id).toBe('custom');
    });

    it('passes the currently stored option to the handler for pre-population', () => {
      const storedOption: ChipOption<string | null> = { id: 'custom', label: 'Previous result', value: 'prev' };
      const handler = vi.fn().mockReturnValue(EMPTY);
      customHost.options = [{ id: 'custom', label: 'Custom', value: null, selectHandler: handler }];
      customHost.value.set([storedOption]);
      customFixture.detectChanges();
      customOpen();
      customOptions()[0].click();
      customFixture.detectChanges();
      expect(handler).toHaveBeenCalledWith(storedOption);
    });
  });
});

/*

    it('shows default label when only an isDefault option is selected', () => {
      host.options.set([...OPTIONS_WITH_DEFAULT]);
      host.value.set([OPTIONS_WITH_DEFAULT[0]]);
      fixture.detectChanges();
      expect(chip().textContent).toContain('Filter');
    });

    it('shows non-default label when isDefault and non-default are both selected', () => {
      host.multiselect.set(true);
      host.options.set([...OPTIONS_WITH_DEFAULT]);
      host.value.set([OPTIONS_WITH_DEFAULT[0], OPTIONS_WITH_DEFAULT[1]]);
      fixture.detectChanges();
      expect(chip().textContent).toContain('Option A');
      expect(chip().textContent).not.toContain('All');
    });
  });

  describe('active state', () => {
    it('is not active when nothing is selected', () => {
      expect(chip().classList.contains('chip--active')).toBe(false);
    });

    it('is active when a non-default option is selected', () => {
      host.value.set([OPTIONS[0]]);
      fixture.detectChanges();
      expect(chip().classList.contains('chip--active')).toBe(true);
    });

    it('is not active when only an isDefault option is selected', () => {
      host.options.set([...OPTIONS_WITH_DEFAULT]);
      host.value.set([OPTIONS_WITH_DEFAULT[0]]);
      fixture.detectChanges();
      expect(chip().classList.contains('chip--active')).toBe(false);
    });
  });

  describe('aria attributes', () => {
    it('sets aria-haspopup="listbox" on the trigger', () => {
      expect(chip().getAttribute('aria-haspopup')).toBe('listbox');
    });

    it('sets aria-expanded="false" when closed', () => {
      expect(chip().getAttribute('aria-expanded')).toBe('false');
    });

    it('sets aria-expanded="true" when open', () => {
      open();
      expect(chip().getAttribute('aria-expanded')).toBe('true');
    });
  });

  describe('dropdown', () => {
    it('opens on click', () => {
      open();
      expect(panel()).toBeTruthy();
    });

    it('closes on second click', () => {
      open();
      chip().click();
      fixture.detectChanges();
      expect(panel()).toBeFalsy();
    });

    it('renders all available options', () => {
      open();
      expect(options().length).toBe(OPTIONS.length);
    });

    it('renders option labels', () => {
      open();
      const labels = options().map((o) => o.textContent?.trim());
      expect(labels).toContain('Option A');
      expect(labels).toContain('Option B');
    });
  });

  describe('single select', () => {
    it('clicking an option updates the value', () => {
      open();
      options()[0].click();
      fixture.detectChanges();
      expect(host.value()).toEqual([OPTIONS[0]]);
    });

    it('clicking an option closes the dropdown', () => {
      open();
      options()[0].click();
      fixture.detectChanges();
      expect(panel()).toBeFalsy();
    });

    it('clicking a different option replaces the current value', () => {
      host.value.set([OPTIONS[0]]);
      fixture.detectChanges();
      open();
      options()[1].click();
      fixture.detectChanges();
      expect(host.value()).toEqual([OPTIONS[1]]);
    });

    it('re-clicking the selected option is a no-op', () => {
      host.value.set([OPTIONS[0]]);
      fixture.detectChanges();
      open();
      options()[0].click();
      fixture.detectChanges();
      expect(host.value()).toEqual([OPTIONS[0]]);
    });

    it('closes the dropdown even when re-clicking the selected option', () => {
      host.value.set([OPTIONS[0]]);
      fixture.detectChanges();
      open();
      options()[0].click();
      fixture.detectChanges();
      expect(panel()).toBeFalsy();
    });

    it('uses role="option" on options', () => {
      open();
      options().forEach((o) => expect(o.getAttribute('role')).toBe('option'));
    });

    it('sets aria-selected="false" on unselected options', () => {
      open();
      options().forEach((o) => expect(o.getAttribute('aria-selected')).toBe('false'));
    });

    it('sets aria-selected="true" on the selected option', () => {
      host.value.set([OPTIONS[1]]);
      fixture.detectChanges();
      open();
      expect(options()[1].getAttribute('aria-selected')).toBe('true');
      expect(options()[0].getAttribute('aria-selected')).toBe('false');
    });

    it('applies selected class to the active option', () => {
      host.value.set([OPTIONS[1]]);
      fixture.detectChanges();
      open();
      expect(options()[1].classList.contains('option-selected')).toBe(true);
      expect(options()[0].classList.contains('option-selected')).toBe(false);
    });
  });

  describe('multi select', () => {
    beforeEach(() => {
      host.multiselect.set(true);
      fixture.detectChanges();
    });

    it('clicking an option adds it to the value', () => {
      open();
      options()[0].click();
      fixture.detectChanges();
      expect(host.value()).toEqual([OPTIONS[0]]);
    });

    it('dropdown stays open after selecting an option', () => {
      open();
      options()[0].click();
      fixture.detectChanges();
      expect(panel()).toBeTruthy();
    });

    it('can select multiple options', () => {
      open();
      options()[0].click();
      fixture.detectChanges();
      options()[1].click();
      fixture.detectChanges();
      expect(host.value()).toEqual([OPTIONS[0], OPTIONS[1]]);
    });

    it('re-clicking a selected option removes it', () => {
      host.value.set([OPTIONS[0]]);
      fixture.detectChanges();
      open();
      options()[0].click();
      fixture.detectChanges();
      expect(host.value()).toEqual([]);
    });

    it('uses role="option" on options', () => {
      open();
      options().forEach((o) => expect(o.getAttribute('role')).toBe('option'));
    });

    it('sets aria-selected="true" on selected options', () => {
      host.value.set([OPTIONS[0]]);
      fixture.detectChanges();
      open();
      expect(options()[0].getAttribute('aria-selected')).toBe('true');
    });

    it('sets aria-selected="false" on unselected options', () => {
      open();
      expect(options()[0].getAttribute('aria-selected')).toBe('false');
    });

    it('shows the reset button when at least one option is selected', () => {
      host.value.set([OPTIONS[0]]);
      fixture.detectChanges();
      open();
      expect(overlayEl.querySelector('select-reset button')).toBeTruthy();
    });

    it('does not show the reset button when nothing is selected', () => {
      open();
      expect(overlayEl.querySelector('select-reset button')).toBeFalsy();
    });

    it('reset button clears all selected options', () => {
      host.value.set([OPTIONS[0], OPTIONS[1]]);
      fixture.detectChanges();
      open();
      (overlayEl.querySelector('select-reset button') as HTMLButtonElement).click();
      fixture.detectChanges();
      expect(host.value()).toEqual([]);
    });
  });

  describe('isDefault options', () => {
    beforeEach(() => {
      host.options.set([...OPTIONS_WITH_DEFAULT]);
      fixture.detectChanges();
    });

    it('applies selected class to the isDefault option when it is selected', () => {
      host.value.set([OPTIONS_WITH_DEFAULT[0]]);
      fixture.detectChanges();
      open();
      expect(options()[0].classList.contains('option-selected')).toBe(true);
    });

    it('chip is not active when only the isDefault option is selected', () => {
      host.value.set([OPTIONS_WITH_DEFAULT[0]]);
      fixture.detectChanges();
      expect(chip().classList.contains('chip-active')).toBe(false);
    });

    it('chip becomes active when a non-default option is also selected', () => {
      host.multiselect.set(true);
      host.value.set([OPTIONS_WITH_DEFAULT[0], OPTIONS_WITH_DEFAULT[1]]);
      fixture.detectChanges();
      expect(chip().classList.contains('chip-active')).toBe(true);
    });
  });

  describe('disabled', () => {
    beforeEach(() => {
      host.disabled.set(true);
      fixture.detectChanges();
    });

    it('the button has the disabled attribute', () => {
      expect(chip().disabled).toBe(true);
    });

    it('does not open the dropdown on click', () => {
      chip().click();
      fixture.detectChanges();
      expect(panel()).toBeFalsy();
    });
  });

  describe('selectHandler', () => {
    let customFixture: ComponentFixture<CustomOptionHost>;
    let customHost: CustomOptionHost;
    let customEl: HTMLElement;

    const customChip = () => customEl.querySelector('button.chip') as HTMLButtonElement;
    const customOptions = () => Array.from(overlayEl.querySelectorAll('.option')) as HTMLElement[];
    const customOpen = () => {
      customChip().click();
      customFixture.detectChanges();
    };

    beforeEach(async () => {
      customFixture = TestBed.createComponent(CustomOptionHost);
      customHost = customFixture.componentInstance;
      customEl = customFixture.nativeElement;
    });

    it('calls selectHandler instead of toggling when a custom option is clicked', () => {
      const handler = vi.fn().mockReturnValue(EMPTY);
      customHost.options = [{ id: 'custom', label: 'Custom', value: null, selectHandler: handler }];
      customFixture.detectChanges();
      customOpen();
      customOptions()[0].click();
      customFixture.detectChanges();
      expect(handler).toHaveBeenCalledOnce();
    });

    it('updates the option label and value when handler returns a result', () => {
      customHost.options = [
        {
          id: 'custom',
          label: 'Custom',
          value: null,
          selectHandler: () => of({ label: 'Result label', value: 'result-value' }),
        },
      ];
      customFixture.detectChanges();
      customOpen();
      customOptions()[0].click();
      customFixture.detectChanges();
      expect(customHost.value()[0]?.label).toBe('Result label');
      expect(customHost.value()[0]?.value).toBe('result-value');
    });

    it('does not update value when handler returns null (cancel)', () => {
      customHost.options = [
        {
          id: 'custom',
          label: 'Custom',
          value: null,
          selectHandler: () => of(null),
        },
      ];
      customFixture.detectChanges();
      customOpen();
      customOptions()[0].click();
      customFixture.detectChanges();
      expect(customHost.value()).toEqual([]);
    });

    it('does not highlight a custom option as selected in the dropdown', () => {
      customHost.options = [
        {
          id: 'custom',
          label: 'Custom',
          value: null,
          selectHandler: () => of({ label: 'Result', value: null }),
        },
      ];
      customHost.value.set([{ id: 'custom', label: 'Result', value: null }]);
      customFixture.detectChanges();
      customOpen();
      expect(customOptions()[0].classList.contains('panel__option--selected')).toBe(false);
    });

    it('replaces a previously selected normal option when a custom option is confirmed', () => {
      const normalOption: ChipOption<string | null> = {
        id: 'normal',
        label: 'Normal',
        value: 'normal',
      };
      const customOption: ChipOption<string | null> = {
        id: 'custom',
        label: 'Custom',
        value: null,
        selectHandler: () => of({ label: 'Custom result', value: null }),
      };
      customHost.options = [normalOption, customOption];
      customHost.value.set([normalOption]);
      customFixture.detectChanges();
      customOpen();
      customOptions()[1].click();dashboar
      customFixture.detectChanges();
      expect(customHost.value().length).toBe(1);
      expect(customHost.value()[0].id).toBe('custom');
    });

    it('passes the currently stored option to the handler for pre-population', () => {
      const storedOption: ChipOption<string | null> = {
        id: 'custom',
        label: 'Previous result',
        value: 'prev',
      };
      const handler = vi.fn().mockReturnValue(EMPTY);
      customHost.options = [{ id: 'custom', label: 'Custom', value: null, selectHandler: handler }];
      customHost.value.set([storedOption]);
      customFixture.detectChanges();
      customOpen();
      customOptions()[0].click();
      customFixture.detectChanges();
      expect(handler).toHaveBeenCalledWith(storedOption);
    });
* */
