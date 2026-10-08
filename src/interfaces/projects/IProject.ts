export interface IProject {
  project_id?: string;
  name: string;
  object: string;
  project_leader: string;
  payroll_plan?: number | null;
  status?: string;
  deleted?: boolean;
}
