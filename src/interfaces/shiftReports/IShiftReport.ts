export interface IShiftReport {
  shift_report_id?: string;
  number: number;
  user: string;
  date: number;
  project: string;
  signed: boolean;
  night_shift: boolean;
  extreme_conditions: boolean;
  deleted?: boolean;
}
