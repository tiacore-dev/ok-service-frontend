import * as React from "react";
import { RoleId } from "../../interfaces/roles/IRole";
import type { IObject } from "../../interfaces/objects/IObject";
import type { IShiftReport } from "../../interfaces/shiftReports/IShiftReport";
import type { ShiftReportMapCoordinate } from "./ShiftReportInfoCard";

interface UseShiftReportMapParams {
  shiftReport?: IShiftReport;
  objectId?: string;
  objectsMap: Record<string, IObject>;
  currentRole: RoleId;
}

export const useShiftReportMap = ({
  shiftReport,
  objectId,
  objectsMap,
  currentRole,
}: UseShiftReportMapParams) => {
  const objectCoordinates =
    React.useMemo<ShiftReportMapCoordinate | null>(() => {
      if (!objectId) return null;
      const relatedObject = objectsMap[objectId];
      if (!relatedObject || !relatedObject.ltd || !relatedObject.lng) {
        return null;
      }

      return {
        lat: relatedObject.ltd,
        lng: relatedObject.lng,
        title: `Объект: ${relatedObject.name}`,
        color: "blue" as const,
      };
    }, [objectId, objectsMap]);

  const shiftStartCoordinates =
    React.useMemo<ShiftReportMapCoordinate | null>(() => {
      if (!shiftReport?.date_start) return null;
      if (typeof shiftReport.lng_start !== "number") return null;
      if (typeof shiftReport.ltd_start !== "number") return null;
      const distanceLabel = shiftReport.distance_start
        ? ` (${shiftReport.distance_start} м от объекта)`
        : "";

      return {
        lat: shiftReport.ltd_start,
        lng: shiftReport.lng_start,
        title: `Место начала смены${distanceLabel}`,
        color: "red" as const,
      };
    }, [shiftReport, shiftReport?.distance_start]);

  const shiftEndCoordinates =
    React.useMemo<ShiftReportMapCoordinate | null>(() => {
      if (!shiftReport?.date_end) return null;
      if (typeof shiftReport.lng_end !== "number") return null;
      if (typeof shiftReport.ltd_end !== "number") return null;
      const distanceLabel = shiftReport.distance_end
        ? ` (${shiftReport.distance_end} м от объекта)`
        : "";

      return {
        lat: shiftReport.ltd_end,
        lng: shiftReport.lng_end,
        title: `Место окончания смены${distanceLabel}`,
        color: "green" as const,
      };
    }, [shiftReport, shiftReport?.distance_end]);

  const mapStartCoordinates = React.useMemo<ShiftReportMapCoordinate[]>(() => {
    const coordinates: ShiftReportMapCoordinate[] = [];
    if (objectCoordinates) coordinates.push(objectCoordinates);
    if (shiftStartCoordinates) coordinates.push(shiftStartCoordinates);
    return coordinates;
  }, [objectCoordinates, shiftStartCoordinates]);

  const mapEndCoordinates = React.useMemo<ShiftReportMapCoordinate[]>(() => {
    const coordinates: ShiftReportMapCoordinate[] = [];
    if (objectCoordinates) coordinates.push(objectCoordinates);
    if (shiftEndCoordinates) coordinates.push(shiftEndCoordinates);
    return coordinates;
  }, [objectCoordinates, shiftEndCoordinates]);

  const canShowStartMapButton = React.useMemo(
    () => currentRole === RoleId.ADMIN && !!mapStartCoordinates,
    [currentRole, mapStartCoordinates.length],
  );

  const canShowEndMapButton = React.useMemo(
    () => currentRole === RoleId.ADMIN && !!mapEndCoordinates,
    [currentRole, mapEndCoordinates.length],
  );

  return {
    mapStartCoordinates,
    mapEndCoordinates,
    canShowStartMapButton,
    canShowEndMapButton,
  };
};
