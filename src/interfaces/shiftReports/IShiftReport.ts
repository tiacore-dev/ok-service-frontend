export interface IShiftReport {
  shift_report_id?: string;
  number: number;
  user: string;
  date: number;
  project: string;
  signed: boolean;
  deleted?: boolean;
}
