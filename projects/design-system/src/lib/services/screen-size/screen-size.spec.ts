import { TestBed } from '@angular/core/testing';
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { Subject } from 'rxjs';

import { ScreenSizeService } from './screen-size';

describe('ScreenSizeService', () => {
  let service: ScreenSizeService;
  let breakpointSubject: Subject<BreakpointState>;

  const emit = (lg: boolean, md: boolean) => {
    breakpointSubject.next({
      matches: lg || md,
      breakpoints: {
        '(min-width: 1200px)': lg,
        '(min-width: 600px)': md,
      },
    });
  };

  beforeEach(() => {
    breakpointSubject = new Subject<BreakpointState>();

    TestBed.configureTestingModule({
      providers: [
        {
          provide: BreakpointObserver,
          useValue: {
            observe: () => breakpointSubject.asObservable(),
          },
        },
      ],
    });

    service = TestBed.inject(ScreenSizeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should default to LG', () => {
    expect(service.size()).toBe('LG');
  });

  it('should be LG when LG breakpoint matches', () => {
    emit(true, true);
    expect(service.size()).toBe('LG');
  });

  it('should be MD when only MD breakpoint matches', () => {
    emit(false, true);
    expect(service.size()).toBe('MD');
  });

  it('should be SM when no breakpoints match', () => {
    emit(false, false);
    expect(service.size()).toBe('SM');
  });

  it('should update reactively when screen size changes', () => {
    emit(false, false);
    expect(service.size()).toBe('SM');

    emit(false, true);
    expect(service.size()).toBe('MD');

    emit(true, true);
    expect(service.size()).toBe('LG');
  });
});
