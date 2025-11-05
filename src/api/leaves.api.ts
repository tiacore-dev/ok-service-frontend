import { apiClient } from "./base";
import type { ILeave } from "../interfaces/leaves/ILeave";
import { ILeaveList } from "../interfaces/leaves/ILeaveList";

export interface EditableLeavePayload extends Omit<ILeave, "leave_id"> {
  password?: string;
}

export const fetchLeaves = async (): Promise<ILeaveList[]> => {
  const { data } = await apiClient.get<{ leaves: ILeaveList[] }>("/leaves/all");
  return data.leaves;
};

export const fetchLeave = async (leaveId: string): Promise<ILeave> => {
  const { data } = await apiClient.get<{ leave: ILeave }>(
    `/leaves/${leaveId}/view`,
  );
  return data.leave;
};

export const createLeave = async (
  payload: EditableLeavePayload,
): Promise<ILeave> => {
  const { data } = await apiClient.post<{ leave: ILeave }>(
    "/leaves/add",
    payload,
  );
  return data.leave;
};

export const updateLeave = async (
  leaveId: string,
  payload: EditableLeavePayload,
): Promise<ILeave> => {
  const { data } = await apiClient.patch<{ leave: ILeave }>(
    `/leaves/${leaveId}/edit`,
    payload,
  );
  return data.leave;
};

export const deleteLeave = async (leaveId: string): Promise<void> => {
  await apiClient.patch(`/leaves/${leaveId}/delete/soft`);
};
