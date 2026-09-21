import * as React from "react";
import dayjs from "dayjs";
import { isAxiosError } from "axios";
import {
  Alert,
  Breadcrumb,
  Button,
  Card,
  InputNumber,
  Modal,
  Select,
  Space,
  Spin,
  Table,
  Tag,
} from "antd";
import { DeleteTwoTone, EditTwoTone, HistoryOutlined } from "@ant-design/icons";
import Title from "antd/es/typography/Title";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  AcceptanceFormModal,
  acceptanceStatusOptions,
} from "../../components/acceptances/AcceptanceFormModal";
import { AcceptanceAttachments } from "./AcceptanceAttachments";
import { NotificationContext } from "../../contexts/NotificationContext";
import type { IAcceptance } from "../../interfaces/acceptances/IAcceptance";
import { RoleId } from "../../interfaces/roles/IRole";
import {
  useAcceptanceQuery,
  useAcceptanceHistoryQuery,
  useAcceptanceRelationsQuery,
  useDeleteAcceptanceMutation,
  useReplaceAcceptanceRelationsMutation,
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
  const [draftQuantities, setDraftQuantities] = React.useState<
    Record<string, number | null>
  >({});
  const draftSourceKeyRef = React.useRef<string | undefined>(undefined);
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
  const { data: objectStatsDetails } = useObjectStatsDetailsQuery(
    project?.object ?? "",
  );
  const { data: relations = [], isPending: relationsPending } =
    useAcceptanceRelationsQuery(acceptanceId);
  const { projectWorks = [], isPending: projectWorksPending } =
    useProjectWorksMap(acceptance?.project_id, {
      enabled: Boolean(acceptance?.project_id),
    });
  const { worksMap } = useWorksMap();
  const { usersMap } = useUsersMap();
  const deleteMutation = useDeleteAcceptanceMutation();
  const updateMutation = useUpdateAcceptanceMutation();
  const replaceRelationsMutation = useReplaceAcceptanceRelationsMutation();

  const projectStats = React.useMemo(
    () =>
      objectStatsDetails?.projects.find(
        (item) => item.project_id === acceptance?.project_id,
      ),
    [acceptance?.project_id, objectStatsDetails?.projects],
  );
  const persistedQuantitiesByWorkId = React.useMemo(() => {
    const quantities = new Map<string, number>();
    relations.forEach((relation) => {
      quantities.set(
        relation.work_id,
        (quantities.get(relation.work_id) ?? 0) + Number(relation.quantity),
      );
    });
    return quantities;
  }, [relations]);
  const specificationWorks = React.useMemo(() => {
    const works = new Map<
      string,
      { workId: string; name: string; specificationQuantity: number }
    >();

    projectWorks.forEach((projectWork) => {
      if (!projectWork.work || works.has(projectWork.work)) return;
      works.set(projectWork.work, {
        workId: projectWork.work,
        name: worksMap[projectWork.work]?.name ?? projectWork.project_work_name,
        specificationQuantity: Number(projectWork.quantity ?? 0),
      });
    });

    return Array.from(works.values());
  }, [projectWorks, worksMap]);
  const workQuantitiesByWorkId = React.useMemo(
    () =>
      new Map<
        string,
        {
          specificationQuantity: number;
          presentedQuantity: number;
          availableQuantity: number;
        }
      >(
        specificationWorks.map((work) => {
          const stats = projectStats?.stats[work.workId];
          const specificationQuantity = Number(
            stats?.project_work_quantity ?? work.specificationQuantity,
          );
          const presentedQuantity = Number(stats?.presented_quantity ?? 0);

          return [
            work.workId,
            {
              specificationQuantity,
              presentedQuantity,
              availableQuantity: Math.max(
                specificationQuantity - presentedQuantity,
                0,
              ),
            },
          ] as const;
        }),
      ),
    [projectStats?.stats, specificationWorks],
  );
  const savedDraftQuantities = React.useMemo(
    () =>
      specificationWorks.reduce<Record<string, number>>((quantities, work) => {
        quantities[work.workId] =
          persistedQuantitiesByWorkId.get(work.workId) ?? 0;
        return quantities;
      }, {}),
    [persistedQuantitiesByWorkId, specificationWorks],
  );
  const draftSourceKey = React.useMemo(
    () =>
      specificationWorks
        .map(
          (work) =>
            `${work.workId}:${persistedQuantitiesByWorkId.get(work.workId) ?? 0}`,
        )
        .join("|"),
    [persistedQuantitiesByWorkId, specificationWorks],
  );

  React.useEffect(() => {
    if (draftSourceKeyRef.current === draftSourceKey) return;
    draftSourceKeyRef.current = draftSourceKey;
    setDraftQuantities(savedDraftQuantities);
  }, [draftSourceKey, savedDraftQuantities]);

  const hasDraftChanges = specificationWorks.some(
    (work) =>
      Number(draftQuantities[work.workId] ?? 0) !==
      Number(savedDraftQuantities[work.workId] ?? 0),
  );

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

  const saveRelations = async () => {
    if (!acceptance) return;
    try {
      await replaceRelationsMutation.mutateAsync({
        acceptanceId: acceptance.id,
        relationIds: relations.map((relation) => relation.id),
        works: specificationWorks
          .map((work) => ({
            work_id: work.workId,
            quantity: Number(draftQuantities[work.workId] ?? 0),
          }))
          .filter((work) => work.quantity > 0),
      });
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
            : "Не удалось сохранить работы",
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
              <Space size="small">
                <Button
                  disabled={
                    !hasDraftChanges || replaceRelationsMutation.isPending
                  }
                  onClick={() => setDraftQuantities(savedDraftQuantities)}
                >
                  Отменить
                </Button>
                <Button
                  type="primary"
                  disabled={!hasDraftChanges}
                  loading={replaceRelationsMutation.isPending}
                  onClick={saveRelations}
                >
                  Сохранить
                </Button>
              </Space>
            )}
          </div>
          <Table
            bordered={!isMobile()}
            className="acceptance__table"
            loading={relationsPending || projectWorksPending}
            rowKey="workId"
            pagination={false}
            dataSource={specificationWorks}
            columns={[
              {
                title: "Работа",
                dataIndex: "name",
              },
              {
                title: "По спецификации",
                dataIndex: "workId",
                width: 150,
                render: (workId: string) =>
                  workQuantitiesByWorkId.get(workId)?.specificationQuantity ??
                  0,
              },
              {
                title: "Предъявлено",
                dataIndex: "workId",
                width: 130,
                render: (workId: string) =>
                  workQuantitiesByWorkId.get(workId)?.presentedQuantity ?? 0,
              },
              {
                title: "Доступно",
                dataIndex: "workId",
                width: 120,
                render: (workId: string) =>
                  workQuantitiesByWorkId.get(workId)?.availableQuantity ?? 0,
              },
              {
                title: "Количество в приёмке",
                dataIndex: "workId",
                width: 220,
                render: (workId: string) => {
                  const quantities = workQuantitiesByWorkId.get(workId);
                  const maximumQuantity =
                    (quantities?.availableQuantity ?? 0) +
                    (persistedQuantitiesByWorkId.get(workId) ?? 0);
                  return canManage ? (
                    <InputNumber
                      min={0}
                      max={maximumQuantity}
                      value={draftQuantities[workId] ?? null}
                      disabled={replaceRelationsMutation.isPending}
                      style={{ width: "100%" }}
                      onChange={(value) =>
                        setDraftQuantities((quantities) => ({
                          ...quantities,
                          [workId]: value,
                        }))
                      }
                    />
                  ) : (
                    savedDraftQuantities[workId] ?? 0
                  );
                },
              },
            ]}
          />
        </section>
      </main>
      {canManage && (
        <AcceptanceFormModal
          open={editOpen}
          projectId={acceptance.project_id}
          acceptance={acceptance}
          onClose={() => setEditOpen(false)}
        />
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
