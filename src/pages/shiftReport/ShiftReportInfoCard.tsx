import * as React from "react";
import { Button, Card, Space, Typography } from "antd";
import {
  dateTimestampToLocalDateTimeString,
  dateTimestampToLocalString,
} from "../../utils/dateConverter";
import type { IShiftReport } from "../../interfaces/shiftReports/IShiftReport";
import { MapViewer } from "../../components/Map/MapViewer";

const { Text } = Typography;

export interface ShiftReportMapCoordinate {
  lat: number;
  lng: number;
  title?: string;
  color?: string;
}

interface ShiftReportInfoCardProps {
  shiftReport: IShiftReport;
  objectName?: string;
  projectName?: string;
  projectLeaderName?: string;
  userName?: string;
  showDistances: boolean;
  canShowStartMapButton: boolean;
  canShowEndMapButton: boolean;
  mapStartCoordinates: ShiftReportMapCoordinate[];
  mapEndCoordinates: ShiftReportMapCoordinate[];
  canStartShift: boolean;
  canCompleteShift: boolean;
  onStartShift: () => void;
  onCompleteShift: () => void;
  isStartingShift: boolean;
  isCompletingShift: boolean;
  canSign: boolean;
  onSign: () => void;
  signDisabled: boolean;
}

export const ShiftReportInfoCard = ({
  shiftReport,
  objectName,
  projectName,
  projectLeaderName,
  userName,
  showDistances,
  canShowStartMapButton,
  canShowEndMapButton,
  mapStartCoordinates,
  mapEndCoordinates,
  canStartShift,
  canCompleteShift,
  onStartShift,
  onCompleteShift,
  isStartingShift,
  isCompletingShift,
  canSign,
  onSign,
  signDisabled,
}: ShiftReportInfoCardProps) => {
  const shiftNumber = shiftReport.number?.toString().padStart(5, "0");

  return (
    <Card className="shift-report__card">
      <p>Номер: {shiftNumber}</p>
      <p>Дата: {dateTimestampToLocalString(shiftReport.date)}</p>
      <p>Исполнитель: {userName ?? ""}</p>
      <p>Объект: {objectName}</p>
      <p>Спецификация: {projectName}</p>
      <p>{`Прораб: ${projectLeaderName ?? ""}`}</p>
      <p>Комментарий: {shiftReport.comment || "-"}</p>
      <p>{shiftReport.signed ? "Согласовано" : "Не согласовано"}</p>
      {shiftReport.date_start && (
        <p>
          Дата начала:{" "}
          {dateTimestampToLocalDateTimeString(shiftReport.date_start)}
          {showDistances && shiftReport.distance_start !== null && (
            <> ({shiftReport.distance_start} м)</>
          )}
          {canShowStartMapButton && (
            <MapViewer
              coordinates={mapStartCoordinates}
              buttonType="icon"
              buttonText="Посмотреть на карте"
              modalTitle={`Смена № ${shiftNumber}`}
            />
          )}
        </p>
      )}
      {shiftReport.date_end && (
        <p>
          Дата завершения:{" "}
          {dateTimestampToLocalDateTimeString(shiftReport.date_end)}
          {showDistances && shiftReport.distance_end !== null && (
            <> ({shiftReport.distance_end} м)</>
          )}
          {canShowEndMapButton && (
            <MapViewer
              coordinates={mapEndCoordinates}
              buttonType="icon"
              buttonText="Посмотреть на карте"
              modalTitle={`Смена № ${shiftNumber}`}
            />
          )}
        </p>
      )}
      {shiftReport.night_shift && <p>Ночная смена (+25%)</p>}
      {shiftReport.extreme_conditions && <p>Особые условия (+25%)</p>}
      {(canStartShift || canCompleteShift) && (
        <div className="shift-report__shift-actions">
          {canStartShift && (
            <Button
              onClick={onStartShift}
              type="primary"
              loading={isStartingShift}
              className="shift-report__start-button"
            >
              Начать смену
            </Button>
          )}
          {canCompleteShift && (
            <Button
              onClick={onCompleteShift}
              type="primary"
              loading={isCompletingShift}
              className="shift-report__complete-button"
            >
              Завершить смену
            </Button>
          )}
        </div>
      )}
      {canSign && (
        <Space direction="vertical">
          <Button onClick={onSign} type="primary" disabled={signDisabled}>
            Согласовано
          </Button>
          {signDisabled && (
            <Text type="danger">
              Записи смены выходят за пределы спецификации
            </Text>
          )}
        </Space>
      )}
    </Card>
  );
};
