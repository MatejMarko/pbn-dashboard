import { Observable } from 'rxjs';
import { SvgNames } from '../svg/svg-names.enum';

export interface ChipOption<T = unknown> {
  id: string;
  label: string;
  value: T;
  icon?: SvgNames;
  isDefault?: boolean;
  selectHandler?: (current: ChipOption<T>) => Observable<{ label: string; value: T } | null>;
}
