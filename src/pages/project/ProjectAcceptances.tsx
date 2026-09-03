import * as React from "react";
import dayjs from "dayjs";
import { Button, Modal, Select, Table, Tag, Tooltip } from "antd";
import {
  DeleteTwoTone,
  EditTwoTone,
  EyeOutlined,
  PlusCircleTwoTone,
} from "@ant-design/icons";
import { Link } from "react-router-dom";
import Title from "antd/es/typography/Title";
import { AcceptanceFormModal } from "../../components/acceptances/AcceptanceFormModal";
import { NotificationContext } from "../../contexts/NotificationContext";
import type { IAcceptance } from "../../interfaces/acceptances/IAcceptance";
import {
  useAcceptancesQuery,
  useDeleteAcceptanceMutation,
  useUpdateAcceptanceMutation,
} from "../../queries/acceptances";
import { dateFormat } from "../../utils/dateConverter";
import { isMobile } from "../../utils/isMobile";

const statusLabels = {
  presented: "Предъявлено",
  violations_found: "Выявлены нарушения",
  accepted_on_site: "Принято на объекте",
  documents_signed: "Документы подписаны",
} as const;
const statusColors = {
  presented: "blue",
  violations_found: "orange",
  accepted_on_site: "green",
  documents_signed: "success",
} as const;

export const ProjectAcceptances = ({
  projectId,
  canManage,
}: {
  projectId: string;
  canManage: boolean;
}) => {
  const [modalOpen, setModalOpen] = React.useState(false);
  const [editingAcceptance, setEditingAcceptance] =
    React.useState<IAcceptance | null>(null);
  const notificationApi = React.useContext(NotificationContext);
  const { data: acceptances = [], isPending } = useAcceptancesQuery(projectId);
  const deleteMutation = useDeleteAcceptanceMutation();
  const updateMutation = useUpdateAcceptanceMutation();

  const closeModal = () => {
    setModalOpen(false);
    setEditingAcceptance(null);
  };

  const remove = async (acceptance: IAcceptance) => {
    try {
      await deleteMutation.mutateAsync({ id: acceptance.id, projectId });
    } catch (error) {
      notificationApi?.error({
        message: "Ошибка",
        description:
          error instanceof Error ? error.message : "Не удалось удалить приёмку",
        placement: "bottomRight",
      });
    }
  };

  const updateStatus = async (
    acceptance: IAcceptance,
    status: IAcceptance["status"],
  ) => {
    try {
      await updateMutation.mutateAsync({
        id: acceptance.id,
        payload: {
          project_id: projectId,
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

  return (
    <section className="project__acceptances-section">
      <div className="project__section-header">
        <Title level={4} className="project__section-title">
          Приёмки работ
        </Title>
        {canManage && (
          <Button
            icon={<PlusCircleTwoTone twoToneColor="#ff1616" />}
            onClick={() => setModalOpen(true)}
          >
            Добавить приёмку
          </Button>
        )}
      </div>
      <Table
        bordered={!isMobile()}
        rowKey="id"
        loading={isPending}
        pagination={false}
        dataSource={acceptances}
        className="project__table"
        columns={[
          {
            title: "Дата",
            dataIndex: "date",
            width: 130,
            render: (value: number) => dayjs(value).format(dateFormat),
          },
          {
            title: "Статус",
            dataIndex: "status",
            width: 214,
            render: (value: keyof typeof statusLabels, record: IAcceptance) =>
              canManage ? (
                <Select
                  size="small"
                  value={value}
                  options={Object.entries(statusLabels).map(
                    ([status, label]) => ({ value: status, label }),
                  )}
                  loading={updateMutation.isPending}
                  disabled={updateMutation.isPending}
                  style={{ width: 190 }}
                  onChange={(status: IAcceptance["status"]) =>
                    updateStatus(record, status)
                  }
                />
              ) : (
                <Tag color={statusColors[value]}>{statusLabels[value]}</Tag>
              ),
          },
          {
            title: "Комментарий",
            dataIndex: "comment",
            render: (value?: string) => value || "—",
          },
          {
            title: "",
            width: canManage ? 112 : 48,
            render: (_: unknown, record: IAcceptance) => (
              <div className="project__table-actions">
                <Tooltip title="Открыть">
                  <Link
                    className="project__table-action"
                    to={`/acceptances/${record.id}`}
                  >
                    <EyeOutlined />
                  </Link>
                </Tooltip>
                {canManage && (
                  <Tooltip title="Редактировать">
                    <Button
                      type="link"
                      className="project__table-action"
                      icon={<EditTwoTone twoToneColor="#e40808" />}
                      onClick={() => {
                        setEditingAcceptance(record);
                        setModalOpen(true);
                      }}
                    />
                  </Tooltip>
                )}
                {canManage && (
                  <Button
                    type="link"
                    className="project__table-action"
                    icon={<DeleteTwoTone twoToneColor="#e40808" />}
                    onClick={() =>
                      Modal.confirm({
                        title: "Удалить приёмку?",
                        content: "Все добавленные работы будут удалены.",
                        okText: "Удалить",
                        cancelText: "Отмена",
                        okButtonProps: { danger: true },
                        onOk: () => remove(record),
                      })
                    }
                  />
                )}
              </div>
            ),
          },
        ]}
      />
      {canManage && (
        <AcceptanceFormModal
          open={modalOpen}
          projectId={projectId}
          acceptance={editingAcceptance}
          onClose={closeModal}
        />
      )}
    </section>
  );
};
