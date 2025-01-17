import { RoleId } from "../roles/IRole";

export interface IUser {
  user_id: string;
  name: string;
  login: string;
  role: RoleId;
}
