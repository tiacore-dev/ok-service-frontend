import {
  ILeaveReason,
  LeaveReasonId,
} from "../interfaces/leaveReasones/ILeaveReason";

export const leaveReasonesMap: Record<LeaveReasonId, ILeaveReason> = {
  [LeaveReasonId.VACATION]: {
    reason_id: LeaveReasonId.VACATION,
    name: "Отпуск",
  },
  [LeaveReasonId.DAY_OFF]: {
    reason_id: LeaveReasonId.DAY_OFF,
    name: "Отгул",
  },
  [LeaveReasonId.SICK_LEAVE]: {
    reason_id: LeaveReasonId.SICK_LEAVE,
    name: "Больничный",
  },
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
