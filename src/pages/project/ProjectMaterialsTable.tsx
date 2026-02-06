import * as React from "react";
import {
  Button,
  Form,
  InputNumber,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table,
} from "antd";
import { DeleteTwoTone, EditTwoTone, PlusCircleTwoTone } from "@ant-design/icons";
import { isMobile } from "../../utils/isMobile";
import type { IProjectMaterialsListColumn } from "../../interfaces/projectMaterials/IProjectMaterialsList";
import {
  useCreateProjectMaterialMutation,
  useDeleteProjectMaterialMutation,
  useProjectMaterialsQuery,
  useUpdateProjectMaterialMutation,
} from "../../queries/projectMaterials";
import { useMaterialsMap } from "../../queries/materials";
import { useProjectWorksMap } from "../../queries/projectWorks";
import { NotificationContext } from "../../contexts/NotificationContext";
import { selectFilterHandler } from "../../utils/selectFilterHandler";
import "./ProjectMaterialsTable.less";

interface ProjectMaterialsTableProps {
  projectId: string;
  canManage: boolean;
}

export const ProjectMaterialsTable = ({
  projectId,
  canManage,
}: ProjectMaterialsTableProps) => {
  const [form] = Form.useForm<{ material: string; quantity: number }>();
  const [modalOpen, setModalOpen] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [editingRecord, setEditingRecord] =
    React.useState<IProjectMaterialsListColumn | null>(null);
  const notificationApi = React.useContext(NotificationContext);

  const {
    data: projectMaterials = [],
    isPending,
    isFetching,
  } = useProjectMaterialsQuery(projectId, { enabled: Boolean(projectId) });
  const { materials, materialsMap } = useMaterialsMap();
  const { projectWorksMap } = useProjectWorksMap(projectId, {
    enabled: Boolean(projectId),
  });
  const createProjectMaterialMutation = useCreateProjectMaterialMutation();
  const updateProjectMaterialMutation = useUpdateProjectMaterialMutation();
  const deleteProjectMaterialMutation = useDeleteProjectMaterialMutation();

  const projectMaterialsData: IProjectMaterialsListColumn[] = React.useMemo(
    () =>
      (projectMaterials ?? []).map((doc) => ({
        ...doc,
        key:
          doc.project_material_id ??
          `${doc.project}-${doc.material}-${doc.project_work ?? "manual"}`,
      })),
    [projectMaterials],
  );

  const materialsOptions = React.useMemo(
    () =>
      materials
        .filter((material) => Boolean(material.material_id))
        .map((material) => ({
          label: material.name,
          value: material.material_id as string,
          deleted: material.deleted,
        })),
    [materials],
  );

  const selectableMaterialsOptions = React.useMemo(
    () => materialsOptions.filter((option) => !option.deleted),
    [materialsOptions],
  );

  const openCreateModal = () => {
    if (!projectId) return;
    setEditingRecord(null);
    form.resetFields();
    form.setFieldsValue({ quantity: 0 });
    setModalOpen(true);
  };

  const openEditModal = (record: IProjectMaterialsListColumn) => {
    setEditingRecord(record);
    form.setFieldsValue({
      material: record.material,
      quantity: Number(record.quantity ?? 0),
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingRecord(null);
    form.resetFields();
  };

  const save = async () => {
    try {
      const rowData = await form.validateFields();
      if (!projectId) {
        throw new Error("Не удалось определить спецификацию");
      }
      if (!rowData.material) {
        throw new Error("Не удалось определить материал");
      }

      setSaving(true);
      if (editingRecord) {
        if (!editingRecord.project_material_id) {
          throw new Error("Не удалось определить запись");
        }
        await updateProjectMaterialMutation.mutateAsync({
          projectMaterialId: editingRecord.project_material_id,
          payload: {
            project: projectId,
            material: rowData.material,
            quantity: Number(rowData.quantity),
            project_work: editingRecord.project_work ?? null,
          },
        });
        notificationApi?.success({
          message: "Успешно",
          description: "Запись обновлена",
          placement: "bottomRight",
          duration: 2,
        });
      } else {
        await createProjectMaterialMutation.mutateAsync({
          project: projectId,
          material: rowData.material,
          quantity: Number(rowData.quantity),
          project_work: null,
        });
        notificationApi?.success({
          message: "Успешно",
          description: "Запись добавлена",
          placement: "bottomRight",
          duration: 2,
        });
      }
      closeModal();
    } catch (errInfo) {
      const description =
        errInfo instanceof Error
          ? errInfo.message
          : "Не удалось сохранить запись";
      notificationApi?.error({
        message: "Ошибка",
        description,
        placement: "bottomRight",
        duration: 2,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProjectMaterial = async (projectMaterialId?: string) => {
    if (!projectId || !projectMaterialId) return;
    try {
      await deleteProjectMaterialMutation.mutateAsync({
        projectMaterialId,
        projectId,
      });
      notificationApi?.success({
        message: "Удалено",
        description: "Запись удалена",
        placement: "bottomRight",
        duration: 2,
      });
    } catch (error) {
      const description =
        error instanceof Error ? error.message : "Не удалось удалить запись";
      notificationApi?.error({
        message: "Ошибка",
        description,
        placement: "bottomRight",
        duration: 2,
      });
    }
  };

  const columns = [
    {
      title: "Материал",
      dataIndex: "material",
      key: "material",
      render: (value: string) => materialsMap[value]?.name ?? value,
    },
    {
      title: "Количество",
      dataIndex: "quantity",
      key: "quantity",
    },
    {
      title: "Работа",
      dataIndex: "project_work",
      key: "project_work",
      render: (value: string | null) => {
        if (!value) {
          return "-";
        }
        const projectWork = projectWorksMap[value];
        return projectWork?.project_work_name ?? "—";
      },
    },
    {
      title: "Действия",
      dataIndex: "operation",
      hidden: !canManage,
      width: !isMobile() && "116px",
      render: (_: string, record: IProjectMaterialsListColumn) => {
        return (
          <Space>
            <Button
              icon={<EditTwoTone twoToneColor="#e40808" />}
              type="link"
              onClick={() => openEditModal(record)}
            />
            <Popconfirm
              title="Удалить?"
              onConfirm={() =>
                handleDeleteProjectMaterial(record.project_material_id)
              }
            >
              <Button
                icon={<DeleteTwoTone twoToneColor="#e40808" />}
                type="link"
              />
            </Popconfirm>
          </Space>
        );
      },
    },
  ];
  const tableColumns = canManage
    ? columns
    : columns.filter((col) => !col.hidden);

  return (
    <>
      {canManage && (
        <Button
          onClick={openCreateModal}
          type="default"
          icon={<PlusCircleTwoTone twoToneColor="#ff1616" />}
          className="project-materials__add-button"
        >
          Добавить материал
        </Button>
      )}

      <Table
        pagination={false}
        bordered={!isMobile()}
        dataSource={projectMaterialsData}
        columns={tableColumns}
        loading={isPending || isFetching}
        className="project__materials-table"
      />
      <Modal
        title={
          editingRecord ? "Редактирование материала" : "Добавление материала"
        }
        open={modalOpen}
        onOk={save}
        onCancel={closeModal}
        confirmLoading={saving}
        okText="Сохранить"
        cancelText="Отмена"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Материал"
            name="material"
            rules={[{ required: true, message: "Выберите материал" }]}
          >
            <Select
              showSearch
              filterOption={selectFilterHandler}
              options={selectableMaterialsOptions}
            />
          </Form.Item>
          <Form.Item
            label="Количество"
            name="quantity"
            rules={[{ required: true, message: "Укажите количество" }]}
          >
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};
