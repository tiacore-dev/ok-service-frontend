import { IShiftReportsListColumn } from "../../../interfaces/shiftReports/IShiftReportsList";
import { IProject } from "../../../interfaces/projects/IProject"; // поправь путь
import { IUser } from "../../../interfaces/users/IUser"; // поправь путь

type ShiftStatus = "notOpened" | "empty" | "signed" | "notSigned";

type DayStatuses = Partial<Record<ShiftStatus, IShiftReportsListColumn[]>>;

export type GroupedDay = Record<
  string, // leaderId
  {
    leaderId: string;
    leaderName: string;
    projects: Record<
      string, // projectId
      {
        projectId: string;
        projectName: string;
        object: string;
        statuses: DayStatuses;
      }
    >;
  }
>;

export const groupDayByLeaderAndProject = (
  stats: DayStatuses,
  projectsMap: Record<string, IProject | undefined>,
  usersMap: Record<string, IUser | undefined>,
): GroupedDay => {
  const result: GroupedDay = {};

  const statuses: ShiftStatus[] = ["notOpened", "empty", "notSigned", "signed"];

  for (const status of statuses) {
    const reports = stats[status];
    if (!reports?.length) continue;

    for (const report of reports) {
      const projectId = report.project ?? "unknown_project";
      const project = projectsMap[projectId];
      const projectName = project?.name ?? "Неизвестный проект";
      const object = project?.object ?? "";

      const leaderId = project?.project_leader ?? "unknown_leader";
      const leaderName = usersMap[leaderId]?.name ?? "Неизвестный руководитель";

      // init leader
      if (!result[leaderId]) {
        result[leaderId] = { leaderId, leaderName, projects: {} };
      }

      // init project inside leader
      if (!result[leaderId].projects[projectId]) {
        result[leaderId].projects[projectId] = {
          projectId,
          projectName,
          object,
          statuses: {},
        };
      }

      const cur = result[leaderId].projects[projectId].statuses[status] ?? [];
      result[leaderId].projects[projectId].statuses[status] = [...cur, report];
    }
  }

  return result;
};
