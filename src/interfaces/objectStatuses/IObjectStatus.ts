export enum ObjectStatusId {
  EXPIRED = "in_progress",
  WAITING = "waiting",
  HANDLING = "handling",
  VERIFICATION = "verification",
}

export interface IObjectStatus {
  object_status_id: ObjectStatusId;
  name: string;
}
