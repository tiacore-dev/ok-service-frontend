import {
  ILeaveReason,
  LeaveReasonId,
} from "../interfaces/leaveReasones/ILeaveReason";

export const leaveReasonesMap: Record<LeaveReasonId, ILeaveReason> = {
  [LeaveReasonId.VACATION]: {
    reason_id: LeaveReasonId.VACATION,
    name: "Отпуск",
  },
  [LeaveReasonId.TIME_OFF]: {
    reason_id: LeaveReasonId.TIME_OFF,
    name: "Отгул",
  },
  [LeaveReasonId.SICK]: { reason_id: LeaveReasonId.SICK, name: "Больничный" },
};

export const leaveReasones: ILeaveReason[] = Object.values(leaveReasonesMap);

export const leaveReasonOptions: {
  value: LeaveReasonId;
  text: string;
  label: string;
}[] = leaveReasones.map((reason) => ({
  value: reason.reason_id,
  text: reason.name,
  label: reason.name,
}));
