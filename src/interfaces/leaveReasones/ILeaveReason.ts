export enum LeaveReasonId {
  VACATION = "vacation",
  TIME_OFF = "time-off",
  SICK = "sick",
}

export interface ILeaveReason {
  reason_id: LeaveReasonId;
  name: string;
}
