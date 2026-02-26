import { TestBed } from '@angular/core/testing';

import { Svg } from './svg';

describe('Svg', () => {
  let service: Svg;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Svg);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
