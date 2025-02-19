import { ObjectStatusId } from "../objectStatuses/IObjectStatus";

export interface IObject {
  object_id?: string;
  name: string;
  address: string;
  description: string;
  status: ObjectStatusId;
  manager: string;
  deleted?: boolean;
}
