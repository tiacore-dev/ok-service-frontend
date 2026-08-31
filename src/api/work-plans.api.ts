import { apiClient } from "./base";
import type {
  EditableWorkPlanPayload,
  IWorkPlan,
} from "../interfaces/workPlans/IWorkPlan";

export const fetchWorkPlans = async (year: number): Promise<IWorkPlan[]> => {
  const { data } = await apiClient.get<{ work_plans: IWorkPlan[] }>(
    "/work_plans/all",
    { params: { year, limit: 1000 } },
  );
  return data.work_plans;
};

export const createWorkPlan = async (
  payload: EditableWorkPlanPayload,
): Promise<string> => {
  const { data } = await apiClient.post<{ work_plan_id: string }>(
    "/work_plans/add",
    payload,
  );
  return data.work_plan_id;
};

export const updateWorkPlan = async (
  workPlanId: string,
  payload: EditableWorkPlanPayload,
): Promise<void> => {
  await apiClient.patch(`/work_plans/${workPlanId}/edit`, payload);
};

export const deleteWorkPlan = async (workPlanId: string): Promise<void> => {
  await apiClient.delete(`/work_plans/${workPlanId}/delete/hard`);
};
