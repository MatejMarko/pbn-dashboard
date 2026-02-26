import { Pipe, PipeTransform } from '@angular/core';
import { ScreenSize, SIZE_ORDER } from './screen-size';

/**
 * Returns true when the current screen size is `threshold` or larger.
 *
 * @usageNotes
 * ```html
 * @if (screen.size() | atLeast:'MD') {
 *   <!-- visible on MD and LG -->
 * }
 * ```
 */
@Pipe({ name: 'atLeast', pure: true })
export class AtLeastPipe implements PipeTransform {
  transform(current: ScreenSize, threshold: ScreenSize): boolean {
    return SIZE_ORDER[current] >= SIZE_ORDER[threshold];
  }
}

/**
 * Returns true when the current screen size is `threshold` or smaller.
 *
 * @usageNotes
 * ```html
 * @if (screen.size() | atMost:'MD') {
 *   <!-- visible on SM and MD -->
 * }
 * ```
 */
@Pipe({ name: 'atMost', pure: true })
export class AtMostPipe implements PipeTransform {
  transform(current: ScreenSize, threshold: ScreenSize): boolean {
    return SIZE_ORDER[current] <= SIZE_ORDER[threshold];
  }
}
