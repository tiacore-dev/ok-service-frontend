export interface IProjectStat {
  project_work_quantity: number;
  shift_report_details_quantity: number;
}

export interface IProjectMaterialStat {
  project_material_quantity: number;
  shift_report_material_quantity: number;
}

export interface IProjectStatsResponse {
  stats: Record<string, IProjectStat>;
  material_stats?: Record<string, IProjectMaterialStat>;
}
