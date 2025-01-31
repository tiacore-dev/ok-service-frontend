export interface IWork {
  work_id?: string;
  name: string;
  category: { work_category_id: string; name: string };
  measurement_unit: string;
  deleted?: boolean;
}
