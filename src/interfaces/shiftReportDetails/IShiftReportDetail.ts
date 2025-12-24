export interface IShiftReportDetail {
  shift_report_detail_id?: string;
  shift_report: string;
  project_work: string;
  work: string;
  quantity: number;
  summ: number;
}

export interface IPopulatedShiftReportDetail
  extends Omit<IShiftReportDetail, "project_work"> {
  project_work: {
    project_work_id: string;
    name: string;
  };
}
