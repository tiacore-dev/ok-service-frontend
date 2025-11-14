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
} from "antd";
import Title from "antd/es/typography/Title";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import type { IState } from "../../store/modules";
import { minPageHeight } from "../../utils/pageSettings";
import { isMobile } from "../../utils/isMobile";
import { Link } from "react-router-dom";
import { dateTimestampToLocalString } from "../../utils/dateConverter";
import type { IShiftReportDetailsListColumn } from "../../interfaces/shiftReportDetails/IShiftReportDetailsList";
import { useShiftReportDetailsQuery } from "../../hooks/QueryActions/shift-reports/shift-reports-details/shift-report-details.query";
import { useUsersMap } from "../../queries/users";
import { DeleteTwoTone, EditTwoTone } from "@ant-design/icons";
import { DeleteShiftReportDialog } from "../../components/ActionDialogs/DeleteShiftReportDialog";
import { RoleId } from "../../interfaces/roles/IRole";
import { getCurrentRole } from "../../store/modules/auth";
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

const { Text } = Typography;

export const ShiftReport = () => {
  const [dataSource, setDataSource] = React.useState<
    IShiftReportDetailsListColumn[]
  >([]);
  const currentRole = useSelector(getCurrentRole);
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
  const { projectsMap } = useProjectsMap({ enabled: Boolean(shiftReportData?.project) });
  const { data: projectStat } = useProjectStatQuery(
    shiftReportData?.project ?? "",
    { enabled: Boolean(shiftReportData?.project) },
  );
  const {
    projectWorks,
    projectWorksMap,
    isPending: isProjectWorksPending,
    isFetching: isProjectWorksFetching,
  } = useProjectWorksMap(shiftReportData?.project, {
    enabled: Boolean(shiftReportData?.project),
  });
  const { worksMap } = useWorksMap();
  const stat = projectStat ?? {};

  const object = React.useMemo(
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
      render: (value: string) => {
        const option = projectWorksOptions.find((opt) => opt.value === value);
        return option?.label || value;
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
        <span style={{ color: record.blocked ? "red" : "inherit" }}>
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
        signed: true,
        night_shift: shiftReportData.night_shift,
        extreme_conditions: shiftReportData.extreme_conditions,
        lng: shiftReportData.lng,
        ltd: shiftReportData.ltd,
      };

      editReportMutation({
        report_id: shiftReportData.shift_report_id,
        reportData: updatedReportData,
      });
    }
  }, [shiftReportData, editReportMutation]);

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

  // const objectLink = `/objects/${object}`;
  return (
    <>
      <Breadcrumb
        className="breadcrumb"
        style={isMobile() ? { backgroundColor: "#F8F8F8" } : undefined}
        items={[
          { title: <Link to="/home">Главная</Link> },
          { title: <Link to="/shifts">Смены</Link> },
          {
            title: `Смена № ${shiftReportData.number?.toString().padStart(5, "0")}`,
          },
        ]}
      />

      <Content
        style={{
          padding: "0 24px",
          margin: 0,
          minHeight: minPageHeight(),
          background: "#FFF",
        }}
      >
        <Title level={3}>
          {`Отчет по смене № ${shiftReportData.number?.toString().padStart(5, "0")} от ${dateTimestampToLocalString(shiftReportData.date)}, ${usersMap[shiftReportData.user]?.name ?? ""}`}
        </Title>

        <Space direction="horizontal" size="small">
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

        <Card style={{ margin: "8px 0" }}>
          <p>Номер: {shiftReportData.number?.toString().padStart(5, "0")}</p>
          <p>Дата: {dateTimestampToLocalString(shiftReportData.date)}</p>
          <p>Исполнитель: {usersMap[shiftReportData.user]?.name ?? ""}</p>
          <p>Объект: {objectsMap[object]?.name}</p>
          <p>Спецификация: {projectsMap[shiftReportData.project]?.name}</p>
          <p>{`Прораб: ${usersMap[projectsMap[shiftReportData.project]?.project_leader]?.name ?? ""}`}</p>
          <p>{shiftReportData.signed ? "Согласовано" : "Не согласовано"}</p>
          {shiftReportData.night_shift && <p>Ночная смена (+25%)</p>}
          {shiftReportData.extreme_conditions && <p>Особые условия (+25%)</p>}
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
          className="shift-reports_filters"
        >
          {canEdit && (
            <Button
              onClick={handleAdd}
              type="primary"
              style={{ marginBottom: 16 }}
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
        />

        <EditableShiftReportDetailDialog
          visible={modalVisible}
          onCancel={() => setModalVisible(false)}
          onSave={handleSave}
          initialValues={currentRecord || undefined}
          projectWorksOptions={projectWorksOptions}
          loading={loading}
        />
      </Content>
    </>
  );
};
