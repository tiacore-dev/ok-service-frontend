export interface IShiftStandard {
  shift_standard_id: string;
  category: number;
  standard: number;
  production_rate_rub?: number | null;
  penalty_rate_percent?: number | null;
  notification_text: string;
  created_at: number;
  created_by: string;
}
