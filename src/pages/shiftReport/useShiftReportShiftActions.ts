import * as React from "react";
import { notification } from "antd";
import type { IObject } from "../../interfaces/objects/IObject";
import type { IShiftReport } from "../../interfaces/shiftReports/IShiftReport";
import type { EditableShiftReport } from "../../hooks/QueryActions/shift-reports/shift-reports.mutations";
import { calculateDistanceMeters } from "./shiftReport.utils";

type EditReportMutation = (
  variables: { report_id: string; reportData: EditableShiftReport },
  options?: { onSettled?: () => void },
) => void;

interface UseShiftReportShiftActionsParams {
  shiftReport?: IShiftReport;
  currentUserId?: string;
  objectId?: string;
  objectsMap: Record<string, IObject>;
  editReportMutation: EditReportMutation;
}

export const useShiftReportShiftActions = ({
  shiftReport,
  currentUserId,
  objectId,
  objectsMap,
  editReportMutation,
}: UseShiftReportShiftActionsParams) => {
  const [isStartingShift, setIsStartingShift] = React.useState(false);
  const [isCompletingShift, setIsCompletingShift] = React.useState(false);

  const canStartShift = React.useMemo(() => {
    if (!shiftReport) return false;
    if (shiftReport.signed) return false;
    if (shiftReport.date_start) return false;
    return shiftReport.user === currentUserId;
  }, [shiftReport, currentUserId]);

  const canCompleteShift = React.useMemo(() => {
    if (!shiftReport) return false;
    if (shiftReport.signed) return false;
    if (!shiftReport.date_start) return false;
    if (shiftReport.date_end) return false;
    return shiftReport.user === currentUserId;
  }, [shiftReport, currentUserId]);

  const getDistanceToObjectMeters = React.useCallback(
    (lat: number, lng: number) => {
      if (!objectId) return null;
      const relatedObject = objectsMap[objectId];
      if (!relatedObject || !relatedObject.ltd || !relatedObject.lng) {
        return null;
      }

      return Math.round(
        calculateDistanceMeters(relatedObject.ltd, relatedObject.lng, lat, lng),
      );
    },
    [objectId, objectsMap],
  );

  const handleStartShift = React.useCallback(() => {
    if (!shiftReport) {
      return;
    }

    if (
      typeof window === "undefined" ||
      typeof navigator === "undefined" ||
      !navigator.geolocation
    ) {
      notification.error({
        message: "Не удалось определить местоположение",
        description: "Браузер не поддерживает геолокацию",
        placement: "bottomRight",
      });
      return;
    }

    setIsStartingShift(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const distanceStart = getDistanceToObjectMeters(latitude, longitude);
        const updatedReportData: EditableShiftReport = {
          user: shiftReport.user,
          date: shiftReport.date,
          date_start: Date.now(),
          date_end: shiftReport.date_end,
          project: shiftReport.project,
          comment: shiftReport.comment,
          signed: shiftReport.signed,
          night_shift: shiftReport.night_shift,
          extreme_conditions: shiftReport.extreme_conditions,
          lng_start: longitude,
          ltd_start: latitude,
          lng_end: shiftReport.lng_end,
          ltd_end: shiftReport.ltd_end,
          distance_start: distanceStart ?? undefined,
          distance_end: shiftReport.distance_end,
        };

        editReportMutation(
          {
            report_id: shiftReport.shift_report_id as string,
            reportData: updatedReportData,
          },
          {
            onSettled: () => setIsStartingShift(false),
          },
        );
      },
      (error) => {
        notification.error({
          message: "Не удалось определить местоположение",
          description: error.message,
          placement: "bottomRight",
        });
        setIsStartingShift(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
    );
  }, [editReportMutation, getDistanceToObjectMeters, shiftReport]);

  const handleCompleteShift = React.useCallback(() => {
    if (!shiftReport) {
      return;
    }

    if (
      typeof window === "undefined" ||
      typeof navigator === "undefined" ||
      !navigator.geolocation
    ) {
      notification.error({
        message: "Не удалось определить местоположение",
        description: "Браузер не поддерживает геолокацию",
        placement: "bottomRight",
      });
      return;
    }

    setIsCompletingShift(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const distanceEnd = getDistanceToObjectMeters(latitude, longitude);
        const updatedReportData: EditableShiftReport = {
          user: shiftReport.user,
          date: shiftReport.date,
          date_start: shiftReport.date_start,
          date_end: Date.now(),
          project: shiftReport.project,
          comment: shiftReport.comment,
          signed: shiftReport.signed,
          night_shift: shiftReport.night_shift,
          extreme_conditions: shiftReport.extreme_conditions,
          lng_start: shiftReport.lng_start,
          ltd_start: shiftReport.ltd_start,
          lng_end: longitude,
          ltd_end: latitude,
          distance_start: shiftReport.distance_start,
          distance_end: distanceEnd ?? undefined,
        };

        editReportMutation(
          {
            report_id: shiftReport.shift_report_id as string,
            reportData: updatedReportData,
          },
          {
            onSettled: () => setIsCompletingShift(false),
          },
        );
      },
      (error) => {
        notification.error({
          message: "Не удалось определить местоположение",
          description: error.message,
          placement: "bottomRight",
        });
        setIsCompletingShift(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
    );
  }, [editReportMutation, getDistanceToObjectMeters, shiftReport]);

  return {
    canStartShift,
    canCompleteShift,
    handleStartShift,
    handleCompleteShift,
    isStartingShift,
    isCompletingShift,
  };
};
