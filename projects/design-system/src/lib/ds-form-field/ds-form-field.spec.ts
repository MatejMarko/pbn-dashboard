import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DsFormField } from './ds-form-field';

describe('DsFormField', () => {
  let component: DsFormField;
  let fixture: ComponentFixture<DsFormField>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DsFormField],
    }).compileComponents();

    fixture = TestBed.createComponent(DsFormField);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
