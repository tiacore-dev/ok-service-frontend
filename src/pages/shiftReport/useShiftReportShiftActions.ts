import * as React from "react";
import { notification } from "antd";
import type { IObject } from "../../interfaces/objects/IObject";
import type { IShiftReport } from "../../interfaces/shiftReports/IShiftReport";
import { calculateDistanceMeters } from "./shiftReport.utils";

type ShiftActionMutation = (
  variables: {
    report_id: string;
    coordinates: { ltd: number; lng: number; distance?: number };
  },
  options?: { onSettled?: () => void },
) => void;

interface UseShiftReportShiftActionsParams {
  shiftReport?: IShiftReport;
  currentUserId?: string;
  objectId?: string;
  objectsMap: Record<string, IObject>;
  startShiftMutation: ShiftActionMutation;
  finishShiftMutation: ShiftActionMutation;
}

export const useShiftReportShiftActions = ({
  shiftReport,
  currentUserId,
  objectId,
  objectsMap,
  startShiftMutation,
  finishShiftMutation,
}: UseShiftReportShiftActionsParams) => {
  const [isStartingShift, setIsStartingShift] = React.useState(false);
  const [isCompletingShift, setIsCompletingShift] = React.useState(false);

  const canStartShift = React.useMemo(() => {
    if (!shiftReport) return false;
    if (shiftReport.deleted) return false;
    if (shiftReport.signed) return false;
    if (shiftReport.date_start) return false;
    return shiftReport.user === currentUserId;
  }, [shiftReport, currentUserId]);

  const canCompleteShift = React.useMemo(() => {
    if (!shiftReport) return false;
    if (shiftReport.deleted) return false;
    if (shiftReport.signed) return false;
    if (!shiftReport.date_start) return false;
    if (shiftReport.date_end) return false;
    return shiftReport.user === currentUserId;
  }, [shiftReport, currentUserId]);

  const getDistanceToObjectMeters = React.useCallback(
    (lat: number, lng: number) => {
      if (!objectId) return undefined;

      const relatedObject = objectsMap[objectId];
      if (
        typeof relatedObject?.ltd !== "number" ||
        typeof relatedObject.lng !== "number"
      ) {
        return undefined;
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
        const distance = getDistanceToObjectMeters(latitude, longitude);
        startShiftMutation(
          {
            report_id: shiftReport.shift_report_id as string,
            coordinates: { ltd: latitude, lng: longitude, distance },
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
  }, [getDistanceToObjectMeters, shiftReport, startShiftMutation]);

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
        const distance = getDistanceToObjectMeters(latitude, longitude);
        finishShiftMutation(
          {
            report_id: shiftReport.shift_report_id as string,
            coordinates: { ltd: latitude, lng: longitude, distance },
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
  }, [finishShiftMutation, getDistanceToObjectMeters, shiftReport]);

  return {
    canStartShift,
    canCompleteShift,
    handleStartShift,
    handleCompleteShift,
    isStartingShift,
    isCompletingShift,
  };
};
