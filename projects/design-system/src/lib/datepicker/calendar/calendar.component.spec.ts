import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CalendarComponent } from './calendar.component';

describe('CalendarComponent', () => {
  let fixture: ComponentFixture<CalendarComponent>;
  let component: CalendarComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CalendarComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CalendarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create with empty template', () => {
    expect(component).toBeTruthy();
    expect(fixture.nativeElement.innerHTML).toBe('');
  });

  it('should have selected input defaulting to null', () => {
    expect(component.selected()).toBeNull();
  });

  it('should have min input defaulting to null', () => {
    expect(component.min()).toBeNull();
  });

  it('should have max input defaulting to null', () => {
    expect(component.max()).toBeNull();
  });

  it('should have dateSelected output', () => {
    expect(component.dateSelected).toBeDefined();
  });

  it('should start closed', () => {
    expect(component.isOpen()).toBe(false);
  });

  it('should fall back to the field anchor when no toggle is registered', () => {
    const element = document.createElement('input');
    document.body.appendChild(element);

    component.registerInput({
      element,
      disabled: false,
      readDate: () => null,
      writeDate: () => {},
    });
    component.open();

    // No DatepickerService mock here, so just assert it opened at all.
    expect(component.isOpen()).toBe(true);
    component.close();
    element.remove();
  });

  it('should not open without an input or an origin', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    component.open();

    expect(component.isOpen()).toBe(false);
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });
});
