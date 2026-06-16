import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { InputComponent } from './input.component';

@Component({
  template: `<input otp-input />`,
  imports: [InputComponent],
})
class TestHostComponent {}

describe('InputComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
    const input = fixture.nativeElement.querySelector('input');
    expect(input).toBeTruthy();
  });
});
