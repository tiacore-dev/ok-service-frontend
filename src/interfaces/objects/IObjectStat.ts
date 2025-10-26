export interface IUserStatsItem {
  user: string;
  status: "empty" | "not-signed" | "signed";
}

export interface IProjectStatsItem {
  project: string;
  users: IUserStatsItem[];
}

export interface IObjectStatsItem {
  object: string;
  done: boolean;
  projects: IProjectStatsItem[];
}
