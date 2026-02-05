export interface IShiftReportMaterial {
  shift_report_material_id?: string;
  shift_report: string;
  material: string;
  quantity: number;
  shift_report_detail?: string | null;
  created_at?: number;
  created_by?: string;
}
