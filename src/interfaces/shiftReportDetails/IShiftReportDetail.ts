export interface IShiftReportDetail {
  shift_report_detail_id?: string;
  shift_report: string;
  project_work: string;
  work: string;
  quantity: number;
  summ: number;
}

export interface IPopulatedShiftReportDetail
  extends Omit<IShiftReportDetail, "project_work" | "shift_report"> {
  project_work: {
    project_work_id: string;
    name: string;
  };
  shift_report: {
    date: string;
    id: string;
    user_id: string;
  };
}
