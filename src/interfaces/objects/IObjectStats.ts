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

export interface IObjectMaterialStats {
  project_material_quantity: number | null;
  project_material_summ: number | null;
  shift_report_material_quantity: number | null;
  shift_report_material_summ_by_estimate: number | null;
  material_name?: string | null;
}

export type ObjectMaterialStats =
  | IObjectMaterialStats
  | Record<string, IObjectMaterialStats | null>;

export interface IObjectProgressStats extends IObjectWorkStats {
  completed_summ?: number;
  completed_estimate_summ?: number;
  specification_summ?: number;
}

export interface IObjectStatsItem {
  object_id: string;
  name: string;
  stats: IObjectWorkStats;
  material_totals?: IObjectMaterialStats | null;
}

export interface IObjectStatsCollection {
  total: IObjectWorkStats;
  material_totals?: IObjectMaterialStats | null;
  objects: IObjectStatsItem[];
  total_count: number;
}

export interface IObjectProjectStatsItem {
  project_id: string;
  name: string;
  stats: IObjectWorkStats | Record<string, IObjectWorkStats | null>;
  material_stats?: ObjectMaterialStats | null;
}

export interface IObjectStats {
  total: IObjectWorkStats;
  material_totals?: IObjectMaterialStats | null;
  projects: IObjectProjectStatsItem[];
}

export interface IObjectWorkStatsDetails extends IObjectWorkStats {
  project_work_name: string;
}

export interface IObjectProjectStatsDetails {
  project_id: string;
  name: string;
  stats: Record<string, IObjectWorkStatsDetails | null>;
  material_stats?: ObjectMaterialStats | null;
}

export interface IObjectStatsDetails {
  total: Record<string, IObjectWorkStatsDetails>;
  material_totals?: ObjectMaterialStats | null;
  projects: IObjectProjectStatsDetails[];
}
