import { RoleId } from "../roles/IRole";

export interface IUsersList {
  user_id: string;
  name: string;
  login: string;
  role: RoleId;
}

export interface IUsersListColumn extends IUsersList {
  key: string;
}
