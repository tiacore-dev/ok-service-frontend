import type { LeaveReasonId } from "../leaveReasones/ILeaveReason";

export type LeavesSortField = "user" | "reason" | "start_date" | "end_date";

export interface ILeavesFiltersState {
  search: string;
  reasonId?: LeaveReasonId;
  dateFrom?: number | null;
  dateTo?: number | null;
  sortField: LeavesSortField;
  sortOrder: "ascend" | "descend";
}

export const defaultLeavesFiltersState: ILeavesFiltersState = {
  search: "",
  reasonId: undefined,
  dateFrom: null,
  dateTo: null,
  sortField: "start_date",
  sortOrder: "ascend",
};
