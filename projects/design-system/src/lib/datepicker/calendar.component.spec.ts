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
});
