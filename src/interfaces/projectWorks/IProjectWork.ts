export interface IProjectWork {
  project_work_id?: string;
  project_work_name: string;
  work: string;
  project: string;
  quantity: number;
  price?: number;
  summ?: number;
  signed: boolean;
}
