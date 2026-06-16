import { OverlayRef } from '@angular/cdk/overlay';
import { Observable, Subject } from 'rxjs';

export class DatepickerRef {
  private readonly closedSubject = new Subject<Date | null>();

  constructor(private readonly overlayRef: OverlayRef) {}

  afterClosed(): Observable<Date | null> {
    return this.closedSubject.asObservable();
  }

  close(result: Date | null = null): void {
    this.overlayRef.dispose();
    this.closedSubject.next(result);
    this.closedSubject.complete();
  }
}
