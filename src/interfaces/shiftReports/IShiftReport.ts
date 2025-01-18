export interface IShiftReport {
  shift_report_id?: string;
  user: string;
  date: number;
  project: string;
  project_leader: string;
  signed: boolean;
  deleted?: boolean;
}
