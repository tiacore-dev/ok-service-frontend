import { LeaveReasonId } from "../leaveReasones/ILeaveReason";

export interface ILeave {
  leave_id?: string;
  start_date?: number;
  end_date?: number;
  reason: LeaveReasonId;
  user: string;
  responsible: string;
  comment: string;
  created_by: string;
  created_at: 0;
  deleted: boolean;
}
