export interface IObjectWorkStats {
  project_work_quantity: number | null;
  project_work_summ: number | null;
  shift_report_details_quantity: number | null;
  shift_report_details_summ: number | null;
  shift_report_details_summ_by_estimate: number | null;
  presented_quantity: number | null;
  presented_summ: number | null;
  accepted_quantity: number | null;
  accepted_summ: number | null;
}

export interface IObjectStatsItem {
  object_id: string;
  name: string;
  stats: IObjectWorkStats;
}

export interface IObjectStatsCollection {
  total: IObjectWorkStats;
  objects: IObjectStatsItem[];
  total_count: number;
}
