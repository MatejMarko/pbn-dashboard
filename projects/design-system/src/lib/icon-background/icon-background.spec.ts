import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IconBackground } from './icon-background';

describe('IconBackground', () => {
  let component: IconBackground;
  let fixture: ComponentFixture<IconBackground>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IconBackground]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IconBackground);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
