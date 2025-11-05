export enum LeaveReasonId {
  VACATION = "vacation",
  DAY_OFF = "day_off",
  SICK_LEAVE = "sick_leave",
}

export interface ILeaveReason {
  reason_id: LeaveReasonId;
  name: string;
}
