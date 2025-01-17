export enum RoleId {
  USER = "user",
  ADMIN = "admin",
  MANAGER = "manager",
  PROJECT_LEADER = "project-leader",
}

export interface IRole {
  role_id: RoleId;
  name: string;
}
