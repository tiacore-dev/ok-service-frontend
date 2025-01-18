import { IUser } from "./IUser";

export interface IUsersList extends IUser {}

export interface IUsersListColumn extends IUsersList {
  key: string;
}
