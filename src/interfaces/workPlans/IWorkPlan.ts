export interface IWorkPlan {
  work_plan_id: string;
  user_id?: string;
  date: string;
  summ: string;
  description?: string;
  deleted: boolean;
}

export interface EditableWorkPlanPayload {
  user_id?: string;
  date: string;
  summ: string;
  description?: string;
}
