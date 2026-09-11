import * as React from "react";
import dayjs from "dayjs";
import { isAxiosError } from "axios";
import {
  Alert,
  Breadcrumb,
  Button,
  Card,
  Form,
  InputNumber,
  Modal,
  Select,
  Space,
  Spin,
  Table,
  Tag,
} from "antd";
import {
  DeleteTwoTone,
  EditTwoTone,
  HistoryOutlined,
  PlusCircleTwoTone,
} from "@ant-design/icons";
import Title from "antd/es/typography/Title";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  AcceptanceFormModal,
  acceptanceStatusOptions,
} from "../../components/acceptances/AcceptanceFormModal";
import { AcceptanceAttachments } from "./AcceptanceAttachments";
import { NotificationContext } from "../../contexts/NotificationContext";
import type {
  IAcceptance,
  IWorkAcceptanceRelation,
} from "../../interfaces/acceptances/IAcceptance";
import { RoleId } from "../../interfaces/roles/IRole";
import {
  useAcceptanceQuery,
  useAcceptanceHistoryQuery,
  useAcceptanceRelationsQuery,
  useCreateAcceptanceRelationMutation,
  useDeleteAcceptanceMutation,
  useDeleteAcceptanceRelationMutation,
  useUpdateAcceptanceRelationMutation,
  useUpdateAcceptanceMutation,
} from "../../queries/acceptances";
import { useObjectsMap } from "../../queries/objects";
import {
  useProjectQuery,
  useProjectStatusesQuery,
} from "../../queries/projects";
import { useProjectWorksMap } from "../../queries/projectWorks";
import { useObjectStatsDetailsQuery } from "../../queries/objectStats";
import { useWorksMap } from "../../queries/works";
import { useUsersMap } from "../../queries/users";
import { getCurrentRole, getCurrentUserId } from "../../store/modules/auth";
import { dateFormat, dateTimeFormat } from "../../utils/dateConverter";
import { isMobile } from "../../utils/isMobile";
import "./acceptance.page.less";

const statusColors = {
  presented: "blue",
  violations_found: "orange",
  accepted_on_site: "green",
  documents_signed: "success",
} as const;

interface IQuantityExceededError {
  code: "WORK_ACCEPTANCE_QUANTITY_EXCEEDED";
  specification_quantity: number;
  available_quantity: number;
  requested_quantity: number;
  exceeded_quantity: number;
}

const getQuantityExceededError = (error: unknown) => {
  if (
    !isAxiosError<IQuantityExceededError>(error) ||
    error.response?.data.code !== "WORK_ACCEPTANCE_QUANTITY_EXCEEDED"
  ) {
    return undefined;
  }

  return error.response.data;
};

const getQuantityExceededDescription = (error: IQuantityExceededError) => (
  <>
    <div>В спецификации: {error.specification_quantity} шт.</div>
    <div>Доступно для приёмки: {error.available_quantity} шт.</div>
    <div>Указано: {error.requested_quantity} шт.</div>
    <div>Превышение: {error.exceeded_quantity} шт.</div>
  </>
);

export const Acceptance = () => {
  const { acceptanceId } = useParams();
  const navigate = useNavigate();
  const role = useSelector(getCurrentRole);
  const currentUserId = useSelector(getCurrentUserId);
  const notificationApi = React.useContext(NotificationContext);
  const [editOpen, setEditOpen] = React.useState(false);
  const [historyOpen, setHistoryOpen] = React.useState(false);
  const [addWorkOpen, setAddWorkOpen] = React.useState(false);
  const [editingRelation, setEditingRelation] =
    React.useState<IWorkAcceptanceRelation | null>(null);
  const [relationForm] = Form.useForm<{ work_id: string; quantity: number }>();
  const [editRelationForm] = Form.useForm<{ quantity: number }>();
  const [selectedWorkId, setSelectedWorkId] = React.useState<string>();

  const { data: acceptance, isPending } = useAcceptanceQuery(acceptanceId);
  const {
    data: history = [],
    isPending: isHistoryPending,
    isError: isHistoryError,
  } = useAcceptanceHistoryQuery(acceptanceId, historyOpen);
  const { data: project, isPending: isProjectPending } = useProjectQuery(
    acceptance?.project_id,
    { enabled: Boolean(acceptance?.project_id) },
  );
  const { data: projectStatuses = [] } = useProjectStatusesQuery();
  const { objectsMap } = useObjectsMap();
  const {
    data: objectStatsDetails,
    isPending: isObjectStatsDetailsPending,
    isError: isObjectStatsDetailsError,
  } = useObjectStatsDetailsQuery(project?.object ?? "");
  const { data: relations = [], isPending: relationsPending } =
    useAcceptanceRelationsQuery(acceptanceId);
  const { projectWorks = [] } = useProjectWorksMap(acceptance?.project_id, {
    enabled: Boolean(acceptance?.project_id),
  });
  const { worksMap } = useWorksMap();
  const { usersMap } = useUsersMap();
  const deleteMutation = useDeleteAcceptanceMutation();
  const updateMutation = useUpdateAcceptanceMutation();
  const createRelationMutation = useCreateAcceptanceRelationMutation();
  const updateRelationMutation = useUpdateAcceptanceRelationMutation();
  const deleteRelationMutation = useDeleteAcceptanceRelationMutation();

  const projectStats = React.useMemo(
    () =>
      objectStatsDetails?.projects.find(
        (item) => item.project_id === acceptance?.project_id,
      ),
    [acceptance?.project_id, objectStatsDetails?.projects],
  );
  const availableQuantityByWorkId = React.useMemo(() => {
    const quantities = new Map<string, number>();

    if (!projectStats) return quantities;

    projectWorks.forEach((projectWork) => {
      if (!projectWork.work) return;

      const stats = projectStats?.stats[projectWork.work];
      const specificationQuantity = Number(
        stats?.project_work_quantity ?? projectWork.quantity ?? 0,
      );
      const presentedQuantity = Number(stats?.presented_quantity ?? 0);
      const availableQuantity = Math.max(
        specificationQuantity - presentedQuantity,
        0,
      );

      quantities.set(
        projectWork.work,
        (quantities.get(projectWork.work) ?? 0) + availableQuantity,
      );
    });

    return quantities;
  }, [projectStats?.stats, projectWorks]);
  const workOptions = React.useMemo(
    () =>
      projectWorks
        .filter((projectWork) => {
          const availableQuantity = availableQuantityByWorkId.get(
            projectWork.work,
          );
          return Boolean(availableQuantity && availableQuantity > 0);
        })
        .filter(
          (projectWork, index, works) =>
            works.findIndex((item) => item.work === projectWork.work) === index,
        )
        .map((projectWork) => ({
          value: projectWork.work,
          label:
            worksMap[projectWork.work]?.name ?? projectWork.project_work_name,
          availableQuantity:
            availableQuantityByWorkId.get(projectWork.work) ?? 0,
        })),
    [availableQuantityByWorkId, projectWorks, worksMap],
  );
  const quantityMax = availableQuantityByWorkId.get(selectedWorkId ?? "");
  const editQuantityMax = editingRelation
    ? (availableQuantityByWorkId.get(editingRelation.work_id) ?? 0) +
      Number(editingRelation.quantity)
    : undefined;

  const removeAcceptance = async () => {
    if (!acceptance) return;
    try {
      await deleteMutation.mutateAsync({
        id: acceptance.id,
        projectId: acceptance.project_id,
      });
      navigate(`/projects/${acceptance.project_id}`);
    } catch (error) {
      notificationApi?.error({
        message: "Ошибка",
        description:
          error instanceof Error ? error.message : "Не удалось удалить приёмку",
        placement: "bottomRight",
      });
    }
  };

  const addRelation = async () => {
    if (!acceptance) return;
    const values = await relationForm.validateFields();
    try {
      await createRelationMutation.mutateAsync({
        acceptance_id: acceptance.id,
        ...values,
      });
      relationForm.resetFields();
      setSelectedWorkId(undefined);
      setAddWorkOpen(false);
    } catch (error) {
      const quantityExceededError = getQuantityExceededError(error);
      notificationApi?.error({
        message: quantityExceededError
          ? "Общее количество созданных приёмов работ превышает количество, указанное в спецификации для данной работы."
          : "Ошибка",
        description: quantityExceededError
          ? getQuantityExceededDescription(quantityExceededError)
          : error instanceof Error
            ? error.message
            : "Не удалось добавить работу",
        placement: "bottomRight",
      });
    }
  };

  const updateRelation = async () => {
    if (!editingRelation) return;
    const values = await editRelationForm.validateFields();
    try {
      await updateRelationMutation.mutateAsync({
        id: editingRelation.id,
        payload: {
          acceptance_id: editingRelation.acceptance_id,
          work_id: editingRelation.work_id,
          quantity: values.quantity,
        },
      });
      editRelationForm.resetFields();
      setEditingRelation(null);
    } catch (error) {
      const quantityExceededError = getQuantityExceededError(error);
      notificationApi?.error({
        message: quantityExceededError
          ? "Общее количество созданных приёмов работ превышает количество, указанное в спецификации для данной работы."
          : "Ошибка",
        description: quantityExceededError
          ? getQuantityExceededDescription(quantityExceededError)
          : error instanceof Error
            ? error.message
            : "Не удалось изменить работу",
        placement: "bottomRight",
      });
    }
  };

  const updateStatus = async (status: IAcceptance["status"]) => {
    if (!acceptance) return;
    try {
      await updateMutation.mutateAsync({
        id: acceptance.id,
        payload: {
          project_id: acceptance.project_id,
          date: acceptance.date,
          status,
          comment: acceptance.comment,
        },
      });
    } catch (error) {
      notificationApi?.error({
        message: "Ошибка",
        description:
          error instanceof Error
            ? error.message
            : "Не удалось изменить статус приёмки",
        placement: "bottomRight",
      });
    }
  };

  if (isPending || !acceptance || isProjectPending) return <Spin />;

  const object = project ? objectsMap[project.object] : undefined;
  const isAdmin = role === RoleId.ADMIN;
  const isProjectLeader =
    role === RoleId.PROJECT_LEADER && currentUserId === project?.project_leader;
  const canView = isAdmin || role === RoleId.MANAGER || isProjectLeader;
  const isProjectClosed =
    project?.status === "Закрыто" ||
    projectStatuses.some(
      (projectStatus) =>
        projectStatus.value === project?.status &&
        projectStatus.label === "Закрыто",
    );
  const canManage =
    (role === RoleId.MANAGER || isAdmin) &&
    (acceptance.status !== "documents_signed" || isAdmin) &&
    (!isProjectClosed || isAdmin);
  const status = acceptanceStatusOptions.find(
    (option) => option.value === acceptance.status,
  );

  if (!canView) {
    return (
      <main className="acceptance">
        <Alert type="error" showIcon message="Нет доступа к приёмке работ" />
      </main>
    );
  }

  return (
    <>
      <Breadcrumb
        className="breadcrumb"
        items={[
          { title: <Link to="/home">Главная</Link> },
          { title: <Link to="/objects">Объекты</Link> },
          {
            title: object ? (
              <Link to={`/objects/${project?.object}`}>{object.name}</Link>
            ) : (
              "Объект"
            ),
          },
          {
            title: (
              <Link to={`/projects/${acceptance.project_id}`}>
                {project?.name ?? "Спецификация"}
              </Link>
            ),
          },
          { title: "Приёмка" },
        ]}
      />
      <main className="acceptance">
        <div className="acceptance__header">
          <Title level={3} className="acceptance__title">
            Приёмка работ от {dayjs(acceptance.date).format(dateFormat)}
          </Title>
          <Space size="small">
            <Button
              icon={<HistoryOutlined />}
              onClick={() => setHistoryOpen(true)}
            >
              История изменений
            </Button>
            {canManage && (
              <>
                <Button
                  icon={<EditTwoTone twoToneColor="#e40808" />}
                  onClick={() => setEditOpen(true)}
                >
                  Редактировать
                </Button>
                <Button
                  danger
                  icon={<DeleteTwoTone twoToneColor="#e40808" />}
                  onClick={() =>
                    Modal.confirm({
                      title: "Удалить приёмку?",
                      content: "Все добавленные работы будут удалены.",
                      okText: "Удалить",
                      cancelText: "Отмена",
                      okButtonProps: { danger: true },
                      onOk: removeAcceptance,
                    })
                  }
                >
                  Удалить
                </Button>
              </>
            )}
          </Space>
        </div>
        <Card className="acceptance__card">
          <p>Дата: {dayjs(acceptance.date).format(dateFormat)}</p>
          <p>
            Статус:{" "}
            {canManage ? (
              <Select
                size="small"
                value={acceptance.status}
                options={[...acceptanceStatusOptions]}
                loading={updateMutation.isPending}
                disabled={updateMutation.isPending}
                onChange={updateStatus}
                style={{ width: 210 }}
              />
            ) : (
              <Tag color={statusColors[acceptance.status]}>{status?.label}</Tag>
            )}
          </p>
          {acceptance.comment && <p>Комментарий: {acceptance.comment}</p>}
        </Card>

        <AcceptanceAttachments
          acceptanceId={acceptance.id}
          canManage={canManage}
        />

        <section className="acceptance__works">
          <div className="acceptance__section-header">
            <Title level={4} className="acceptance__section-title">
              Работы
            </Title>
            {canManage && (
              <Button
                icon={<PlusCircleTwoTone twoToneColor="#ff1616" />}
                disabled={
                  isObjectStatsDetailsPending ||
                  (!isObjectStatsDetailsError && workOptions.length === 0)
                }
                onClick={() => setAddWorkOpen(true)}
              >
                Добавить работу
              </Button>
            )}
          </div>
          <Table
            bordered={!isMobile()}
            className="acceptance__table"
            loading={relationsPending}
            rowKey="id"
            pagination={false}
            dataSource={relations}
            columns={[
              {
                title: "Работа",
                dataIndex: "work_id",
                render: (id: string) => worksMap[id]?.name ?? id,
              },
              { title: "Количество", dataIndex: "quantity", width: 180 },
              ...(canManage
                ? [
                    {
                      title: "Действия",
                      width: 96,
                      render: (_: unknown, record: IWorkAcceptanceRelation) => (
                        <Space size={4}>
                          <Button
                            type="link"
                            icon={<EditTwoTone twoToneColor="#e40808" />}
                            disabled={
                              isObjectStatsDetailsPending ||
                              isObjectStatsDetailsError
                            }
                            onClick={() => {
                              setEditingRelation(record);
                              editRelationForm.setFieldsValue({
                                quantity: record.quantity,
                              });
                            }}
                          />
                          <Button
                            type="link"
                            icon={<DeleteTwoTone twoToneColor="#e40808" />}
                            onClick={() =>
                              Modal.confirm({
                                title: "Удалить работу из приёмки?",
                                okText: "Удалить",
                                cancelText: "Отмена",
                                okButtonProps: { danger: true },
                                onOk: () =>
                                  deleteRelationMutation.mutateAsync({
                                    id: record.id,
                                    acceptanceId: acceptance.id,
                                  }),
                              })
                            }
                          />
                        </Space>
                      ),
                    },
                  ]
                : []),
            ]}
          />
        </section>
      </main>
      {canManage && (
        <>
          <AcceptanceFormModal
            open={editOpen}
            projectId={acceptance.project_id}
            acceptance={acceptance}
            onClose={() => setEditOpen(false)}
          />
          <Modal
            open={addWorkOpen}
            title="Добавить работу в приёмку"
            onCancel={() => {
              setAddWorkOpen(false);
              relationForm.resetFields();
              setSelectedWorkId(undefined);
            }}
            onOk={addRelation}
            okText="Добавить"
            cancelText="Отмена"
            confirmLoading={createRelationMutation.isPending}
          >
            {isObjectStatsDetailsError ? (
              <Alert
                type="error"
                showIcon
                message="Не удалось загрузить доступное количество работ"
              />
            ) : (
              <Form form={relationForm} layout="vertical">
                <Form.Item
                  name="work_id"
                  label="Работа"
                  rules={[{ required: true, message: "Выберите работу" }]}
                >
                  <Select
                    placeholder="Выберите работу"
                    options={workOptions}
                    loading={isObjectStatsDetailsPending}
                    disabled={isObjectStatsDetailsPending}
                    onChange={(workId) => {
                      setSelectedWorkId(workId);
                      relationForm.setFieldValue("quantity", undefined);
                    }}
                  />
                </Form.Item>
                <Form.Item
                  name="quantity"
                  label={
                    quantityMax !== undefined
                      ? `Количество (доступно: ${quantityMax})`
                      : "Количество"
                  }
                  rules={[
                    { required: true, message: "Укажите количество" },
                    {
                      validator: (_, value) =>
                        quantityMax === undefined || value <= quantityMax
                          ? Promise.resolve()
                          : Promise.reject(
                              new Error(`Доступно для приёмки: ${quantityMax}`),
                            ),
                    },
                  ]}
                >
                  <InputNumber
                    min={0.01}
                    max={quantityMax}
                    style={{ width: "100%" }}
                  />
                </Form.Item>
              </Form>
            )}
          </Modal>
          <Modal
            open={Boolean(editingRelation)}
            title="Редактировать количество"
            onCancel={() => {
              editRelationForm.resetFields();
              setEditingRelation(null);
            }}
            onOk={updateRelation}
            okText="Сохранить"
            cancelText="Отмена"
            confirmLoading={updateRelationMutation.isPending}
          >
            <Form form={editRelationForm} layout="vertical">
              <Form.Item
                name="quantity"
                label={
                  editQuantityMax !== undefined
                    ? `Количество (доступно: ${editQuantityMax})`
                    : "Количество"
                }
                rules={[
                  { required: true, message: "Укажите количество" },
                  {
                    validator: (_, value) =>
                      editQuantityMax === undefined || value <= editQuantityMax
                        ? Promise.resolve()
                        : Promise.reject(
                            new Error(
                              `Доступно для приёмки: ${editQuantityMax}`,
                            ),
                          ),
                  },
                ]}
              >
                <InputNumber
                  min={0.01}
                  max={editQuantityMax}
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </Form>
          </Modal>
        </>
      )}
      <Modal
        open={historyOpen}
        title="История изменения статуса"
        footer={null}
        width={760}
        onCancel={() => setHistoryOpen(false)}
      >
        {isHistoryError ? (
          <Alert
            type="error"
            showIcon
            message="Не удалось загрузить историю изменений"
          />
        ) : (
          <Table
            rowKey="id"
            loading={isHistoryPending}
            pagination={false}
            dataSource={history}
            columns={[
              {
                title: "Дата и время",
                dataIndex: "changed_at",
                width: 180,
                render: (value: number) => dayjs(value).format(dateTimeFormat),
              },
              {
                title: "Кем изменено",
                dataIndex: "changed_by",
                render: (value: string) => usersMap[value]?.name ?? value,
              },
              {
                title: "Было",
                dataIndex: "from_status",
                width: 160,
                render: (value: IAcceptance["status"]) =>
                  acceptanceStatusOptions.find(
                    (option) => option.value === value,
                  )?.label ?? value,
              },
              {
                title: "Стало",
                dataIndex: "to_status",
                width: 160,
                render: (value: IAcceptance["status"]) =>
                  acceptanceStatusOptions.find(
                    (option) => option.value === value,
                  )?.label ?? value,
              },
            ]}
          />
        )}
      </Modal>
    </>
  );
};
