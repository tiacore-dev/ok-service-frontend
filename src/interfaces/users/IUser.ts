import { RoleId } from "../roles/IRole";

export interface IUser {
  user_id: string;
  name: string;
  login: string;
  category: number;
  role: RoleId;
  deleted: boolean;
}
