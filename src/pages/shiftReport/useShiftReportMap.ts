import * as React from "react";
import { RoleId } from "../../interfaces/roles/IRole";
import type { IObject } from "../../interfaces/objects/IObject";
import type { IShiftReport } from "../../interfaces/shiftReports/IShiftReport";
import type { ShiftReportMapCoordinate } from "./ShiftReportInfoCard";
import { calculateDistanceMeters } from "./shiftReport.utils";

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

  const startDistance = React.useMemo<number | undefined>(() => {
    if (typeof shiftReport?.distance_start === "number") {
      return shiftReport.distance_start;
    }

    if (!objectCoordinates) return undefined;
    if (typeof shiftReport?.ltd_start !== "number") return undefined;
    if (typeof shiftReport.lng_start !== "number") return undefined;

    return Math.round(
      calculateDistanceMeters(
        objectCoordinates.lat,
        objectCoordinates.lng,
        shiftReport.ltd_start,
        shiftReport.lng_start,
      ),
    );
  }, [
    objectCoordinates,
    shiftReport?.distance_start,
    shiftReport?.lng_start,
    shiftReport?.ltd_start,
  ]);

  const shiftStartCoordinates =
    React.useMemo<ShiftReportMapCoordinate | null>(() => {
      if (!shiftReport?.date_start) return null;
      if (typeof shiftReport.lng_start !== "number") return null;
      if (typeof shiftReport.ltd_start !== "number") return null;
      const distanceLabel =
        typeof startDistance === "number"
          ? ` (${startDistance} м от объекта)`
          : "";

      return {
        lat: shiftReport.ltd_start,
        lng: shiftReport.lng_start,
        title: `Место начала смены${distanceLabel}`,
        color: "red" as const,
      };
    }, [shiftReport, startDistance]);

  const endDistance = React.useMemo<number | undefined>(() => {
    if (typeof shiftReport?.distance_end === "number") {
      return shiftReport.distance_end;
    }

    if (!objectCoordinates) return undefined;
    if (typeof shiftReport?.ltd_end !== "number") return undefined;
    if (typeof shiftReport.lng_end !== "number") return undefined;

    return Math.round(
      calculateDistanceMeters(
        objectCoordinates.lat,
        objectCoordinates.lng,
        shiftReport.ltd_end,
        shiftReport.lng_end,
      ),
    );
  }, [
    objectCoordinates,
    shiftReport?.distance_end,
    shiftReport?.lng_end,
    shiftReport?.ltd_end,
  ]);

  const shiftEndCoordinates =
    React.useMemo<ShiftReportMapCoordinate | null>(() => {
      if (!shiftReport?.date_end) return null;
      if (typeof shiftReport.lng_end !== "number") return null;
      if (typeof shiftReport.ltd_end !== "number") return null;
      const distanceLabel =
        typeof endDistance === "number" ? ` (${endDistance} м от объекта)` : "";

      return {
        lat: shiftReport.ltd_end,
        lng: shiftReport.lng_end,
        title: `Место окончания смены${distanceLabel}`,
        color: "green" as const,
      };
    }, [shiftReport, endDistance]);

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
    () => currentRole !== RoleId.USER && !!mapStartCoordinates,
    [currentRole, mapStartCoordinates.length],
  );

  const canShowEndMapButton = React.useMemo(
    () => currentRole !== RoleId.USER && !!mapEndCoordinates,
    [currentRole, mapEndCoordinates.length],
  );

  return {
    mapStartCoordinates,
    mapEndCoordinates,
    startDistance,
    endDistance,
    canShowStartMapButton,
    canShowEndMapButton,
  };
};
