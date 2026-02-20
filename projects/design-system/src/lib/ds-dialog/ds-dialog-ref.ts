import { Subject, Observable } from 'rxjs';

export class DsDialogRef<R = unknown> {
  private readonly _afterClosed = new Subject<R | undefined>();
  private readonly _closeRequest = new Subject<R | undefined>();

  constructor(public readonly id: string) {}

  /** Called by consumer — requests close, service handles the rest */
  close(result?: R): void {
    this._closeRequest.next(result);
    this._closeRequest.complete();
  }

  /** Service listens to this internally */
  _onCloseRequest(): Observable<R | undefined> {
    return this._closeRequest.asObservable();
  }

  /** Service calls this after cleanup is done */
  _finalize(result?: R): void {
    this._afterClosed.next(result);
    this._afterClosed.complete();
  }

  /** Consumer subscribes to this */
  afterClosed(): Observable<R | undefined> {
    return this._afterClosed.asObservable();
  }
}
