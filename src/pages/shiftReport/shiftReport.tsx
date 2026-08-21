"use client";

import * as React from "react";
import { Breadcrumb, Card, Layout, Spin, Table } from "antd";
import Title from "antd/es/typography/Title";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { useQueryClient } from "@tanstack/react-query";
import { isMobile } from "../../utils/isMobile";
import { Link } from "react-router-dom";
import type { IShiftReportDetail } from "../../interfaces/shiftReportDetails/IShiftReportDetail";
import type { IShiftReportDetailsListColumn } from "../../interfaces/shiftReportDetails/IShiftReportDetailsList";
import { useShiftReportDetailsQuery } from "../../hooks/QueryActions/shift-reports/shift-reports-details/shift-report-details.query";
import { useUsersMap } from "../../queries/users";
import { RoleId } from "../../interfaces/roles/IRole";
import { getCurrentRole, getCurrentUserId } from "../../store/modules/auth";
import { useShiftReportQuery } from "../../hooks/QueryActions/shift-reports/shift-reports.query";
import {
  useEditShiftReportMutation,
  useFinishShiftReportMutation,
  useRestoreShiftReportMutation,
  useStartShiftReportMutation,
  useSoftDeleteShiftReportMutation,
} from "../../hooks/QueryActions/shift-reports/shift-reports.mutations";
import {
  useCreateShiftReportDetailMutation,
  useDeleteShiftReportDetailMutation,
  useEditShiftReportDetailMutation,
} from "../../hooks/QueryActions/shift-reports/shift-reports-details/shift-report-details.mutations";
import { EditableShiftReportDetailDialog } from "./EditableShiftReportDetailDialog";
import { useObjectsMap } from "../../queries/objects";
import { useProjectsMap, useProjectStatQuery } from "../../queries/projects";
import { useProjectWorksMap } from "../../queries/projectWorks";
import { useWorksMap } from "../../queries/works";
import { ShiftReportMaterialsTable } from "./ShiftReportMaterialsTable";
import { ShiftReportHeader } from "./ShiftReportHeader";
import { ShiftReportInfoCard } from "./ShiftReportInfoCard";
import { ShiftReportActions } from "./ShiftReportActions";
import { createShiftReportColumns } from "./shiftReport.table";
import { useShiftReportMap } from "./useShiftReportMap";
import { useShiftReportShiftActions } from "./useShiftReportShiftActions";
import "./shiftReport.less";
import { ShiftReportPlaces } from "./ShiftReportPlaces";
import { ShiftReportAttachments } from "./ShiftReportAttachments";

export const ShiftReport = () => {
  const currentRole = useSelector(getCurrentRole);
  const currentUserId = useSelector(getCurrentUserId);
  const queryClient = useQueryClient();
  const { Content } = Layout;
  const mobile = isMobile();

  // Query hooks
  const routeParams = useParams();
  const { data: shiftReportData, isLoading: isShiftReportLoading } =
    useShiftReportQuery(routeParams.shiftId);
  const { data: shiftReportDetailsData, isLoading: isDetailsLoading } =
    useShiftReportDetailsQuery(routeParams.shiftId);

  // Mutation hooks
  const { mutate: editReportMutation } = useEditShiftReportMutation();
  const { mutate: startShiftMutation } = useStartShiftReportMutation();
  const { mutate: finishShiftMutation } = useFinishShiftReportMutation();
  const { mutate: deleteReportMutation } = useSoftDeleteShiftReportMutation();
  const { mutate: restoreReportMutation } = useRestoreShiftReportMutation();
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
  const stat = React.useMemo(() => projectStat ?? {}, [projectStat]);

  const projectData = React.useMemo(
    () => (shiftReportData ? projectsMap[shiftReportData.project] : undefined),
    [projectsMap, shiftReportData],
  );
  const objectId = projectData?.object;

  const hasShiftReport = Boolean(shiftReportData);
  const isSigned = Boolean(shiftReportData?.signed);

  const canManageReport = React.useMemo(
    () => currentRole !== RoleId.USER || !isSigned,
    [currentRole, isSigned],
  );
  const canEdit = canManageReport && !shiftReportData?.deleted;
  const canEditPlaces =
    !shiftReportData?.deleted &&
    (currentRole === RoleId.ADMIN ||
      currentUserId === shiftReportData?.user ||
      (projectData?.project_leader === currentUserId &&
        [RoleId.PROJECT_LEADER, RoleId.MANAGER, RoleId.ADMIN].includes(
          currentRole,
        )));
  const canViewAttachments =
    currentUserId === shiftReportData?.user ||
    currentUserId === projectData?.project_leader ||
    currentRole === RoleId.MANAGER ||
    currentRole === RoleId.ADMIN;
  const canManageAttachments =
    !shiftReportData?.deleted &&
    !isSigned &&
    (currentRole === RoleId.ADMIN ||
      currentUserId === shiftReportData?.user ||
      (projectData?.project_leader === currentUserId &&
        [RoleId.PROJECT_LEADER, RoleId.MANAGER, RoleId.ADMIN].includes(
          currentRole,
        )));
  const canManageSignedAttachments =
    !shiftReportData?.deleted && currentRole === RoleId.ADMIN;
  const canDelete =
    canManageReport && !shiftReportData?.deleted && !shiftReportData?.signed;
  const canRestore = canManageReport && Boolean(shiftReportData?.deleted);
  const canCancelByLeave =
    !shiftReportData?.deleted && !shiftReportData?.date_start;

  const userName = React.useMemo(
    () => (shiftReportData ? usersMap[shiftReportData.user]?.name : undefined),
    [shiftReportData, usersMap],
  );

  const projectName = projectData?.name;
  const projectLeaderName = projectData
    ? usersMap[projectData.project_leader]?.name ?? projectData.project_leader
    : undefined;

  const objectName = React.useMemo(
    () => (objectId ? objectsMap[objectId]?.name : undefined),
    [objectId, objectsMap],
  );

  const showDistances = currentRole !== RoleId.USER;
  const canSign = !isSigned && currentRole !== RoleId.USER;

  const projectWorksData = React.useMemo(
    () => projectWorks ?? [],
    [projectWorks],
  );

  const projectWorksOptions = React.useMemo(
    () =>
      projectWorksData.map((el) => ({
        label: el.project_work_name,
        value: el.project_work_id,
      })),
    [projectWorksData],
  );

  const {
    mapStartCoordinates,
    mapEndCoordinates,
    canShowStartMapButton,
    canShowEndMapButton,
  } = useShiftReportMap({
    shiftReport: shiftReportData,
    objectId,
    objectsMap,
    currentRole,
  });

  const {
    canStartShift,
    canCompleteShift,
    handleStartShift,
    handleCompleteShift,
    isStartingShift,
    isCompletingShift,
  } = useShiftReportShiftActions({
    shiftReport: shiftReportData,
    currentUserId,
    objectId,
    objectsMap,
    startShiftMutation,
    finishShiftMutation,
  });

  const handleAdd = React.useCallback(() => {
    setCurrentRecord(null);
    setModalVisible(true);
  }, []);

  const shiftReportDetails = React.useMemo(
    () => shiftReportDetailsData ?? [],
    [shiftReportDetailsData],
  );

  const shiftReportDetailsRows = React.useMemo<IShiftReportDetailsListColumn[]>(
    () =>
      shiftReportDetails.map((doc, index) => ({
        ...doc,
        key:
          doc.shift_report_detail_id ??
          `${doc.shift_report?.id ?? "shift"}-${index}`,
      })),
    [shiftReportDetails],
  );

  const totalSum = React.useMemo(() => {
    if (!shiftReportDetails.length) return 0;
    return shiftReportDetails.reduce(
      (acc: number, val) => acc + (val.summ || 0),
      0,
    );
  }, [shiftReportDetails]);

  const edit = React.useCallback((record: IShiftReportDetailsListColumn) => {
    setCurrentRecord(record);
    setModalVisible(true);
  }, []);

  const handleSave = React.useCallback(
    async (values: any) => {
      try {
        setLoading(true);
        setModalVisible(false);

        if (shiftReportData) {
          const projectWork = projectWorksMap[values.project_work];
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
    },
    [createDetail, currentRecord, editDetail, projectWorksMap, shiftReportData],
  );

  const handleDelete = React.useCallback(
    (key: string) => {
      if (shiftReportData) {
        deleteDetail({
          id: key,
          shiftReportId: shiftReportData.shift_report_id,
        });
      }
    },
    [deleteDetail, shiftReportData],
  );

  const workRender = React.useCallback(
    (work: string) => worksMap[work]?.name,
    [worksMap],
  );

  const columns = React.useMemo(
    () =>
      createShiftReportColumns({
        canEdit,
        currentRole,
        hasShiftReport,
        isSigned,
        mobile,
        onEdit: edit,
        onDelete: handleDelete,
        workNameById: workRender,
      }),
    [
      canEdit,
      currentRole,
      edit,
      handleDelete,
      hasShiftReport,
      isSigned,
      mobile,
      workRender,
    ],
  );

  const footer = React.useCallback(() => {
    if (!shiftReportDetails.length) return null;
    return `Итого по отчету: ${totalSum} руб.`;
  }, [shiftReportDetails.length, totalSum]);

  const handleDeleteShiftReport = React.useCallback(() => {
    if (!shiftReportData?.shift_report_id || shiftReportData.signed) return;
    deleteReportMutation(shiftReportData.shift_report_id);
  }, [
    deleteReportMutation,
    shiftReportData?.shift_report_id,
    shiftReportData?.signed,
  ]);

  const handleRestoreShiftReport = React.useCallback(() => {
    if (!shiftReportData?.shift_report_id) return;
    restoreReportMutation(shiftReportData.shift_report_id);
  }, [restoreReportMutation, shiftReportData?.shift_report_id]);

  const handleLeaveCreated = React.useCallback(async () => {
    if (!shiftReportData?.shift_report_id) return;
    await queryClient.invalidateQueries({
      queryKey: ["shiftReport", shiftReportData.shift_report_id],
    });
  }, [queryClient, shiftReportData?.shift_report_id]);

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
  }, [shiftReportData, editReportMutation]);

  const checkedData = React.useMemo<IShiftReportDetailsListColumn[]>(() => {
    if (!stat || !shiftReportDetailsRows.length) return shiftReportDetailsRows;

    return shiftReportDetailsRows.map((el) => {
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
  }, [shiftReportDetailsRows, stat]);

  const disabled = React.useMemo(
    () => checkedData.some((el) => el?.blocked),
    [checkedData],
  );

  const detailDialogInitialValues = React.useMemo<
    Partial<IShiftReportDetail> | undefined
  >(
    () =>
      currentRecord
        ? {
            project_work:
              typeof currentRecord.project_work === "string"
                ? currentRecord.project_work
                : currentRecord.project_work?.project_work_id,
            quantity: currentRecord.quantity,
          }
        : undefined,
    [currentRecord],
  );

  const isLoading = isShiftReportLoading || isDetailsLoading;

  if (isLoading) {
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
        <ShiftReportHeader
          shiftReport={shiftReportData}
          userName={userName}
          canEdit={canEdit}
          canDelete={canDelete}
          canRestore={canRestore}
          canCancelByLeave={canCancelByLeave}
          onDelete={handleDeleteShiftReport}
          onRestore={handleRestoreShiftReport}
          onLeaveCreated={handleLeaveCreated}
        />

        <div className="shift-report__overview">
          <ShiftReportInfoCard
            shiftReport={shiftReportData}
            objectName={objectName}
            projectName={projectName}
            projectLeaderName={projectLeaderName}
            userName={userName}
            showDistances={showDistances}
            canShowStartMapButton={canShowStartMapButton}
            canShowEndMapButton={canShowEndMapButton}
            mapStartCoordinates={mapStartCoordinates}
            mapEndCoordinates={mapEndCoordinates}
            canStartShift={canStartShift}
            canCompleteShift={canCompleteShift}
            onStartShift={handleStartShift}
            onCompleteShift={handleCompleteShift}
            isStartingShift={isStartingShift}
            isCompletingShift={isCompletingShift}
            canSign={canSign}
            onSign={handleOnSign}
            signDisabled={disabled}
          />

          <section className="shift-report__places-section">
            <Card className="shift-report__places-card">
              <ShiftReportPlaces
                shiftReportId={shiftReportData.shift_report_id}
                projectId={shiftReportData.project}
                canEdit={canEditPlaces}
              />
            </Card>
          </section>
        </div>

        <ShiftReportActions
          canEdit={canEdit}
          onAdd={handleAdd}
          shiftId={routeParams.shiftId || ""}
          totalSum={totalSum}
          mobile={mobile}
        />

        <Table
          pagination={false}
          bordered={!mobile}
          dataSource={checkedData}
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
        {canViewAttachments && (
          <ShiftReportAttachments
            shiftId={shiftReportData.shift_report_id}
            canUpload={canManageAttachments || canManageSignedAttachments}
            canDelete={canManageAttachments || canManageSignedAttachments}
          />
        )}

        <EditableShiftReportDetailDialog
          visible={modalVisible}
          onCancel={() => setModalVisible(false)}
          onSave={handleSave}
          initialValues={detailDialogInitialValues}
          projectWorksOptions={projectWorksOptions}
          loading={loading}
        />
      </Content>
    </>
  );
};
