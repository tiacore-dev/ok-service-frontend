import * as React from "react";
import { RoleId } from "../../../interfaces/roles/IRole";
import { ObjectStatusId } from "../../../interfaces/objectStatuses/IObjectStatus";
import {
  IProjectStatsItem,
  IUserStatsItem,
} from "../../../interfaces/objects/IObjectStat";
import { ILeaveList } from "../../../interfaces/leaves/ILeaveList";
import { LeaveReasonId } from "../../../interfaces/leaveReasones/ILeaveReason";

export interface IShiftAssignment {
  objectId: string;
  projectId: string;
  status: "signed" | "empty" | "not-signed";
}

export interface IUserShiftAssignment {
  userId: string;
  assignments: IShiftAssignment[];
  leaveReason?: LeaveReasonId;
}

type Projects = {
  project_id?: string;
  object: string;
  project_leader: string;
}[];

export const useAssignmentData = (params: {
  filteredShiftReportsData: Array<{
    user: string;
    project: string;
    shift_report_details_sum: number;
    signed: boolean;
  }>;
  leaveListsData?: ILeaveList[];
  projects: Projects | undefined;
  projectsMap:
    | Record<
        string,
        { project_id?: string; object: string; project_leader: string }
      >
    | undefined;
  objectsMap:
    | Record<string, { object_id?: string; status: ObjectStatusId }>
    | undefined;
  users:
    | Array<{ user_id: string; role: RoleId; name: string; deleted?: boolean }>
    | undefined;
  usersMap: Record<string, { name: string }> | undefined;
  role: RoleId;
  userId: string;
}) => {
  const {
    filteredShiftReportsData,
    leaveListsData,
    projects,
    projectsMap,
    objectsMap,
    users,
    role,
    userId,
  } = params;

  const objectsShiftData = React.useMemo(() => {
    if (!projectsMap || !objectsMap) {
      return [] as { object: string; projects: IProjectStatsItem[] }[];
    }

    const relevantProjects = (projects || []).filter((project) => {
      if (!project.project_id) return false;
      const object = objectsMap[project.object];
      if (!object || object.status !== ObjectStatusId.ACTIVE) return false;
      if (role === RoleId.PROJECT_LEADER)
        return project.project_leader === userId;
      return true;
    });

    if (!relevantProjects.length)
      return [] as { object: string; projects: IProjectStatsItem[] }[];

    const objectProjectsMap: Record<string, IProjectStatsItem[]> = {};
    const projectEntriesMap: Record<string, IProjectStatsItem> = {};

    relevantProjects.forEach((project) => {
      const projectId = project.project_id!;
      const projectStats: IProjectStatsItem = { project: projectId, users: [] };
      if (!objectProjectsMap[project.object])
        objectProjectsMap[project.object] = [];
      objectProjectsMap[project.object].push(projectStats);
      projectEntriesMap[projectId] = projectStats;
    });

    filteredShiftReportsData.forEach((report) => {
      const projectStats = projectEntriesMap[report.project];
      if (!projectStats) return;
      const status: IUserStatsItem["status"] =
        report.shift_report_details_sum === 0
          ? "empty"
          : report.signed
            ? "signed"
            : "not-signed";
      projectStats.users.push({ user: report.user, status });
    });

    return Object.entries(objectProjectsMap).map(
      ([objectId, projectStats]) => ({
        object: objectId,
        projects: projectStats,
      }),
    );
  }, [
    filteredShiftReportsData,
    projects,
    projectsMap,
    objectsMap,
    role,
    userId,
  ]);

  const userShiftData = React.useMemo<IUserShiftAssignment[]>(() => {
    if (!users || !projectsMap || !objectsMap) return [];

    return users
      .filter((user) => user.role === RoleId.USER && !user.deleted)
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((user) => {
        const assignmentsMap: Record<string, IShiftAssignment> = {};

        filteredShiftReportsData.forEach((report) => {
          if (report.user !== user.user_id) return;

          const project = projectsMap[report.project];
          if (!project || !project.project_id) return;

          const object = objectsMap[project.object];
          if (
            !object ||
            object.status !== ObjectStatusId.ACTIVE ||
            !object.object_id
          )
            return;

          const status: IShiftAssignment["status"] =
            report.shift_report_details_sum === 0
              ? "empty"
              : report.signed
                ? "signed"
                : "not-signed";

          const key = `${object.object_id}-${project.project_id}`;
          assignmentsMap[key] = {
            objectId: object.object_id,
            projectId: project.project_id,
            status,
          };
        });

        const leave = leaveListsData?.find(
          (leaveList) => leaveList.user === user.user_id,
        );

        return {
          userId: user.user_id,
          assignments: Object.values(assignmentsMap),
          leaveReason: leave ? leave.reason : undefined,
        };
      });
  }, [filteredShiftReportsData, users, projectsMap, objectsMap]);

  return { objectsShiftData, userShiftData };
};
