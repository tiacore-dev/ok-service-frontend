export enum ObjectStatusId {
  WAITING = "waiting",
  ACTIVE = "active",
  COMPLITED = "complided",
}

export interface IObjectStatus {
  object_status_id: ObjectStatusId;
  name: string;
}
