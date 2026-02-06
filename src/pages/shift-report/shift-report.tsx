"use client";

import * as React from "react";
import {
  Breadcrumb,
  Button,
  Card,
  Layout,
  Popconfirm,
  Space,
  Spin,
  Table,
  Typography,
  notification,
} from "antd";
import Title from "antd/es/typography/Title";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { isMobile } from "../../utils/isMobile";
import { Link } from "react-router-dom";
import {
  dateTimestampToLocalString,
  dateTimestampToLocalDateTimeString,
} from "../../utils/dateConverter";
import type { IShiftReportDetailsListColumn } from "../../interfaces/shiftReportDetails/IShiftReportDetailsList";
import { useShiftReportDetailsQuery } from "../../hooks/QueryActions/shift-reports/shift-reports-details/shift-report-details.query";
import { useUsersMap } from "../../queries/users";
import { DeleteTwoTone, EditTwoTone } from "@ant-design/icons";
import { DeleteShiftReportDialog } from "../../components/ActionDialogs/DeleteShiftReportDialog";
import { RoleId } from "../../interfaces/roles/IRole";
import { getCurrentRole, getCurrentUserId } from "../../store/modules/auth";
import { useShiftReportQuery } from "../../hooks/QueryActions/shift-reports/shift-reports.query";
import {
  useEditShiftReportMutation,
  useHardDeleteShiftReportMutation,
} from "../../hooks/QueryActions/shift-reports/shift-reports.mutations";
import {
  useCreateShiftReportDetailMutation,
  useDeleteShiftReportDetailMutation,
  useEditShiftReportDetailMutation,
} from "../../hooks/QueryActions/shift-reports/shift-reports-details/shift-report-details.mutations";
import { EditableShiftReportDialog } from "../../components/ActionDialogs/EditableShiftReportDialog/EditableShiftReportDialog";
import { EditableShiftReportDetailDialog } from "./EditableShiftReportDetailDialog";
import { DownloadShiftReport } from "./downloadShiftReport";
import { useObjectsMap } from "../../queries/objects";
import { useProjectsMap, useProjectStatQuery } from "../../queries/projects";
import { useProjectWorksMap } from "../../queries/projectWorks";
import { useWorksMap } from "../../queries/works";
import { MapViewer } from "../../components/Map/MapViewer";
import { ShiftReportMaterialsTable } from "./ShiftReportMaterialsTable";
import "./shift-report.less";

const { Text } = Typography;

const toRadians = (value: number) => (value * Math.PI) / 180;
const calculateDistanceMeters = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
) => {
  const R = 6371000; // Earth radius in meters
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export const ShiftReport = () => {
  const [dataSource, setDataSource] = React.useState<
    IShiftReportDetailsListColumn[]
  >([]);
  const currentRole = useSelector(getCurrentRole);
  const currentUserId = useSelector(getCurrentUserId);
  const { Content } = Layout;

  // Query hooks
  const routeParams = useParams();
  const { data: shiftReportData, isLoading: isShiftReportLoading } =
    useShiftReportQuery(routeParams.shiftId);
  const { data: shiftReportDetailsData, isLoading: isDetailsLoading } =
    useShiftReportDetailsQuery(routeParams.shiftId);

  // Mutation hooks
  const { mutate: editReportMutation } = useEditShiftReportMutation();
  const { mutate: deleteReportMutation } = useHardDeleteShiftReportMutation();
  const { mutate: createDetail } = useCreateShiftReportDetailMutation();
  const { mutate: editDetail } = useEditShiftReportDetailMutation();
  const { mutate: deleteDetail } = useDeleteShiftReportDetailMutation();

  // State for modal
  const [modalVisible, setModalVisible] = React.useState(false);
  const [currentRecord, setCurrentRecord] =
    React.useState<IShiftReportDetailsListColumn | null>(null);
  const [loading, setLoading] = React.useState(false);

  // API actions
  const { usersMap } = useUsersMap();
  const { objectsMap } = useObjectsMap();
  const { projectsMap } = useProjectsMap({
    enabled: Boolean(shiftReportData?.project),
  });
  const { data: projectStat } = useProjectStatQuery(
    shiftReportData?.project ?? "",
    { enabled: Boolean(shiftReportData?.project) },
  );
  const { projectWorks, projectWorksMap } = useProjectWorksMap(
    shiftReportData?.project,
    {
      enabled: Boolean(shiftReportData?.project),
    },
  );
  const { worksMap } = useWorksMap();
  const stat = projectStat ?? {};

  const objectId = React.useMemo(
    () => projectsMap[shiftReportData?.project]?.object,
    [projectsMap, shiftReportData?.project],
  );

  const canEdit = currentRole !== RoleId.USER || !shiftReportData?.signed;

  const projectWorksData = projectWorks ?? [];

  const projectWorksMapByProjectId = projectWorksMap;

  const projectWorksOptions = projectWorksData.map((el) => ({
    label: el.project_work_name,
    value: el.project_work_id,
  }));

  const [isStartingShift, setIsStartingShift] = React.useState(false);
  const [isCompletingShift, setIsCompletingShift] = React.useState(false);

  const canStartShift = React.useMemo(() => {
    if (!shiftReportData) return false;
    if (shiftReportData.signed) return false;
    if (shiftReportData.date_start) return false;
    return shiftReportData.user === currentUserId;
  }, [shiftReportData, currentUserId]);

  const canCompleteShift = React.useMemo(() => {
    if (!shiftReportData) return false;
    if (shiftReportData.signed) return false;
    if (!shiftReportData.date_start) return false;
    if (shiftReportData.date_end) return false;
    return shiftReportData.user === currentUserId;
  }, [shiftReportData, currentUserId]);

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

  // Получаем координаты объекта для отображения на карте
  const objectCoordinates = React.useMemo(() => {
    if (!objectId) return null;
    const relatedObject = objectsMap[objectId];
    if (!relatedObject || !relatedObject.ltd || !relatedObject.lng) return null;

    return {
      lat: relatedObject.ltd,
      lng: relatedObject.lng,
      title: `Объект: ${relatedObject.name}`,
      color: "blue" as const,
    };
  }, [objectId, objectsMap]);

  // Получаем координаты смены для отображения на карте
  const shiftStartCoordinates = React.useMemo(() => {
    if (!shiftReportData?.date_start) return null;
    if (typeof shiftReportData.lng_start !== "number") return null;
    if (typeof shiftReportData.ltd_start !== "number") return null;
    const distanceLabel = shiftReportData.distance_start
      ? ` (${shiftReportData.distance_start} м от объекта)`
      : "";

    return {
      lat: shiftReportData.ltd_start,
      lng: shiftReportData.lng_start,
      title: `Место начала смены${distanceLabel}`,
      color: "red" as const,
    };
  }, [shiftReportData, shiftReportData?.distance_start]);

  const shiftEndCoordinates = React.useMemo(() => {
    if (!shiftReportData?.date_end) return null;
    if (typeof shiftReportData.lng_end !== "number") return null;
    if (typeof shiftReportData.ltd_end !== "number") return null;
    const distanceLabel = shiftReportData.distance_end
      ? ` (${shiftReportData.distance_end} м от объекта)`
      : "";

    return {
      lat: shiftReportData.ltd_end,
      lng: shiftReportData.lng_end,
      title: `Место окончания смены${distanceLabel}`,
      color: "green" as const,
    };
  }, [shiftReportData, shiftReportData?.distance_end]);

  const mapStartCoordinates = React.useMemo(() => {
    const coordinates = [];
    if (objectCoordinates) coordinates.push(objectCoordinates);
    if (shiftStartCoordinates) coordinates.push(shiftStartCoordinates);
    return coordinates;
  }, [objectCoordinates, shiftStartCoordinates]);

  const mapEndCoordinates = React.useMemo(() => {
    const coordinates = [];
    if (objectCoordinates) coordinates.push(objectCoordinates);
    if (shiftEndCoordinates) coordinates.push(shiftEndCoordinates);
    return coordinates;
  }, [objectCoordinates, shiftEndCoordinates]);

  const canShowStartMapButton = React.useMemo(() => {
    return currentRole === RoleId.ADMIN && mapStartCoordinates.length === 2;
  }, [currentRole, mapStartCoordinates.length]);

  const canShowEndMapButton = React.useMemo(() => {
    return currentRole === RoleId.ADMIN && mapEndCoordinates.length === 2;
  }, [currentRole, mapEndCoordinates.length]);

  React.useEffect(() => {
    if (shiftReportDetailsData) {
      setDataSource(
        shiftReportDetailsData.map((doc) => ({
          ...doc,
          key: doc.shift_report_detail_id,
        })),
      );
    }
  }, [shiftReportDetailsData]);

  const handleAdd = () => {
    setCurrentRecord(null);
    setModalVisible(true);
  };

  const totalSum = React.useMemo(() => {
    if (!shiftReportDetailsData) return 0;
    return shiftReportDetailsData.reduce(
      (acc: number, val) => acc + (val.summ || 0),
      0,
    );
  }, [shiftReportDetailsData]);

  const edit = (record: IShiftReportDetailsListColumn) => {
    setCurrentRecord(record);
    setModalVisible(true);
  };

  const handleSave = async (values: any) => {
    try {
      setLoading(true);
      setModalVisible(false);

      if (shiftReportData) {
        const projectWork = projectWorksMapByProjectId[values.project_work];
        if (!projectWork) {
          throw new Error("Работа спецификации не найдена");
        }
        const row = {
          ...values,
          work: projectWork.work,
          quantity: Number(values.quantity),
          shift_report: shiftReportData.shift_report_id,
        };

        if (currentRecord) {
          await editDetail({
            id: currentRecord.shift_report_detail_id,
            data: row,
          });
        } else {
          await createDetail(row);
        }
      }
    } catch (error) {
      console.error("Ошибка при сохранении:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (key: string) => {
    if (shiftReportData) {
      deleteDetail({
        id: key,
        shiftReportId: shiftReportData.shift_report_id,
      });
    }
  };

  const workRender = (work: string) => worksMap[work]?.name;

  const columns = [
    {
      title: "Наименование",
      dataIndex: "project_work",
      key: "project_work",
      render: (value: { project_work_id: string; name: string }) => {
        return value.name;
      },
    },
    {
      title: "Работа",
      dataIndex: "work",
      key: "work",
      render: workRender,
    },
    {
      title: "Количество",
      dataIndex: "quantity",
      key: "quantity",
    },
    {
      title: "Сумма",
      dataIndex: "summ",
      key: "summ",
    },
    {
      title: "Проверка",
      dataIndex: "check",
      key: "check",
      hidden:
        currentRole === RoleId.USER ||
        !shiftReportData ||
        shiftReportData.signed,
      render: (text: string, record: IShiftReportDetailsListColumn) => (
        <span
          className={record.blocked ? "shift-report__blocked-text" : undefined}
        >
          {text}
        </span>
      ),
    },
    {
      title: "Действия",
      dataIndex: "operation",
      width: !isMobile() && "116px",
      hidden: !canEdit,
      render: (_: string, record: IShiftReportDetailsListColumn) => (
        <Space>
          <Button
            icon={<EditTwoTone twoToneColor="#e40808" />}
            type="link"
            onClick={() => edit(record)}
          />
          <Popconfirm
            title="Удалить?"
            onConfirm={() => handleDelete(record.key)}
          >
            <Button
              icon={<DeleteTwoTone twoToneColor="#e40808" />}
              type="link"
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const footer = React.useCallback(() => {
    if (!shiftReportDetailsData) return null;
    return `Итого по отчету: ${totalSum} руб.`;
  }, [shiftReportDetailsData]);

  const handleOnSign = React.useCallback(() => {
    if (shiftReportData) {
      const updatedReportData = {
        user: shiftReportData.user,
        date: shiftReportData.date,
        date_start: shiftReportData.date_start,
        date_end: shiftReportData.date_end,
        project: shiftReportData.project,
        comment: shiftReportData.comment,
        signed: true,
        night_shift: shiftReportData.night_shift,
        extreme_conditions: shiftReportData.extreme_conditions,
        lng_start: shiftReportData.lng_start,
        ltd_start: shiftReportData.ltd_start,
        lng_end: shiftReportData.lng_end,
        ltd_end: shiftReportData.ltd_end,
        distance_start: shiftReportData.distance_start,
        distance_end: shiftReportData.distance_end,
      };

      editReportMutation({
        report_id: shiftReportData.shift_report_id,
        reportData: updatedReportData,
      });
    }
  }, [shiftReportData, editReportMutation, getDistanceToObjectMeters]);

  const handleStartShift = React.useCallback(() => {
    if (!shiftReportData) {
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
        const updatedReportData = {
          user: shiftReportData.user,
          date: shiftReportData.date,
          date_start: Date.now(),
          date_end: shiftReportData.date_end,
          project: shiftReportData.project,
          comment: shiftReportData.comment,
          signed: shiftReportData.signed,
          night_shift: shiftReportData.night_shift,
          extreme_conditions: shiftReportData.extreme_conditions,
          lng_start: longitude,
          ltd_start: latitude,
          lng_end: shiftReportData.lng_end,
          ltd_end: shiftReportData.ltd_end,
          distance_start: distanceStart ?? undefined,
          distance_end: shiftReportData.distance_end,
        };

        editReportMutation(
          {
            report_id: shiftReportData.shift_report_id,
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
  }, [shiftReportData, editReportMutation]);

  const handleCompleteShift = React.useCallback(() => {
    if (!shiftReportData) {
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
        const updatedReportData = {
          user: shiftReportData.user,
          date: shiftReportData.date,
          date_start: shiftReportData.date_start,
          date_end: Date.now(),
          project: shiftReportData.project,
          comment: shiftReportData.comment,
          signed: shiftReportData.signed,
          night_shift: shiftReportData.night_shift,
          extreme_conditions: shiftReportData.extreme_conditions,
          lng_start: shiftReportData.lng_start,
          ltd_start: shiftReportData.ltd_start,
          lng_end: longitude,
          ltd_end: latitude,
          distance_start: shiftReportData.distance_start,
          distance_end: distanceEnd ?? undefined,
        };

        editReportMutation(
          {
            report_id: shiftReportData.shift_report_id,
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
  }, [shiftReportData, editReportMutation, getDistanceToObjectMeters]);

  const checedData = React.useMemo(() => {
    if (!stat || !dataSource) return dataSource;

    return dataSource.map((el) => {
      if (stat[el.work]) {
        const statEl = stat[el.work];
        const check = `Завершено: ${statEl.shift_report_details_quantity} из ${statEl.project_work_quantity} Доступно: ${Math.max(
          statEl.project_work_quantity - statEl.shift_report_details_quantity,
          0,
        )}`;

        return {
          ...el,
          check,
          blocked:
            statEl.project_work_quantity -
              statEl.shift_report_details_quantity <
            el.quantity,
        };
      }
      return el;
    });
  }, [dataSource, stat]);

  const disabled = React.useMemo(
    () => checedData.some((el) => el?.blocked),
    [checedData],
  );

  if (isShiftReportLoading || isDetailsLoading) {
    return <Spin />;
  }

  if (!shiftReportData) {
    return <div>Отчет не найден</div>;
  }

  return (
    <>
      <Breadcrumb
        className="breadcrumb"
        items={[
          { title: <Link to="/home">Главная</Link> },
          { title: <Link to="/shifts">Смены</Link> },
          {
            title: `Смена № ${shiftReportData.number?.toString().padStart(5, "0")}`,
          },
        ]}
      />

      <Content className="shift-report__content">
        <Title level={3} className="shift-report__title">
          {`Отчет по смене № ${shiftReportData.number?.toString().padStart(5, "0")} от ${dateTimestampToLocalString(shiftReportData.date)}, ${usersMap[shiftReportData.user]?.name ?? ""}`}
        </Title>

        <Space
          direction="horizontal"
          size="small"
          className="shift-report__header-actions"
        >
          {canEdit && (
            <EditableShiftReportDialog shiftReport={shiftReportData} />
          )}
          {canEdit && (
            <DeleteShiftReportDialog
              onDelete={() =>
                deleteReportMutation(shiftReportData.shift_report_id)
              }
              number={shiftReportData.number}
            />
          )}
        </Space>

        <Card className="shift-report__card">
          <p>Номер: {shiftReportData.number?.toString().padStart(5, "0")}</p>
          <p>Дата: {dateTimestampToLocalString(shiftReportData.date)}</p>
          <p>Исполнитель: {usersMap[shiftReportData.user]?.name ?? ""}</p>
          <p>Объект: {objectsMap[objectId]?.name}</p>
          <p>Спецификация: {projectsMap[shiftReportData.project]?.name}</p>
          <p>{`Прораб: ${usersMap[projectsMap[shiftReportData.project]?.project_leader]?.name ?? ""}`}</p>
          <p>Комментарий: {shiftReportData.comment || "-"}</p>
          <p>{shiftReportData.signed ? "Согласовано" : "Не согласовано"}</p>
          {shiftReportData.date_start && (
            <p>
              Дата начала:{" "}
              {dateTimestampToLocalDateTimeString(shiftReportData.date_start)}
              {currentRole === RoleId.ADMIN &&
                shiftReportData.distance_start !== null && (
                  <> ({shiftReportData.distance_start} м)</>
                )}
              {canShowStartMapButton && (
                <MapViewer
                  coordinates={mapStartCoordinates}
                  buttonType="icon"
                  buttonText="Посмотреть на карте"
                  modalTitle={`Смена № ${shiftReportData.number?.toString().padStart(5, "0")}`}
                />
              )}
            </p>
          )}
          {shiftReportData.date_end && (
            <p>
              Дата завершения:{" "}
              {dateTimestampToLocalDateTimeString(shiftReportData.date_end)}
              {currentRole === RoleId.ADMIN &&
                shiftReportData.distance_end !== null && (
                  <> ({shiftReportData.distance_end} м)</>
                )}
              {canShowEndMapButton && (
                <MapViewer
                  coordinates={mapEndCoordinates}
                  buttonType="icon"
                  buttonText="Посмотреть на карте"
                  modalTitle={`Смена № ${shiftReportData.number?.toString().padStart(5, "0")}`}
                />
              )}
            </p>
          )}
          {shiftReportData.night_shift && <p>Ночная смена (+25%)</p>}
          {shiftReportData.extreme_conditions && <p>Особые условия (+25%)</p>}
          {(canStartShift || canCompleteShift) && (
            <div className="shift-report__shift-actions">
              {canStartShift && (
                <Button
                  onClick={handleStartShift}
                  type="primary"
                  loading={isStartingShift}
                  className="shift-report__start-button"
                >
                  Начать смену
                </Button>
              )}
              {canCompleteShift && (
                <Button
                  onClick={handleCompleteShift}
                  type="primary"
                  loading={isCompletingShift}
                  className="shift-report__complete-button"
                >
                  Завершить смену
                </Button>
              )}
            </div>
          )}
          {!shiftReportData.signed && currentRole !== RoleId.USER && (
            <Space direction="vertical">
              <Button onClick={handleOnSign} type="primary" disabled={disabled}>
                Согласовано
              </Button>
              {disabled && (
                <Text type="danger">
                  Записи смены выходят за пределы спецификации
                </Text>
              )}
            </Space>
          )}
        </Card>

        <Space
          direction={isMobile() ? "vertical" : "horizontal"}
          className="shift-report__actions"
        >
          {canEdit && (
            <Button
              onClick={handleAdd}
              type="primary"
              className="shift-report__add-detail"
            >
              Добавить запись отчета по смене
            </Button>
          )}
          <DownloadShiftReport
            shiftId={routeParams.shiftId || ""}
            summ={totalSum}
          />
        </Space>

        <Table
          pagination={false}
          bordered={!isMobile()}
          dataSource={checedData}
          columns={columns}
          loading={isDetailsLoading}
          footer={footer}
          className="shift-report__table"
        />

        <Title level={4} className="shift-report__materials-title">
          Материалы
        </Title>
        <ShiftReportMaterialsTable
          shiftReportId={shiftReportData.shift_report_id}
          canManage={canEdit}
        />

        <EditableShiftReportDetailDialog
          visible={modalVisible}
          onCancel={() => setModalVisible(false)}
          onSave={handleSave}
          initialValues={{
            ...currentRecord,
            project_work: currentRecord?.project_work.project_work_id,
          }}
          projectWorksOptions={projectWorksOptions}
          loading={loading}
        />
      </Content>
    </>
  );
};
