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
import {
  DeleteTwoTone,
  EditTwoTone,
} from "@ant-design/icons";
import { isMobile } from "../../utils/isMobile";
import type { IWorkMaterialRelationsListColumn } from "../../interfaces/workMaterialRelations/IWorkMaterialRelationsList";
import {
  useCreateWorkMaterialRelationMutation,
  useDeleteWorkMaterialRelationMutation,
  useUpdateWorkMaterialRelationMutation,
  useWorkMaterialRelationsQuery,
} from "../../queries/workMaterialRelations";
import { useWorksMap } from "../../queries/works";
import { useMaterialsMap } from "../../queries/materials";
import { NotificationContext } from "../../contexts/NotificationContext";
import { selectFilterHandler } from "../../utils/selectFilterHandler";
import "./WorkMaterialRelationsTable.less";

interface WorkMaterialRelationsTableProps {
  materialId?: string;
  workId?: string;
  canManage: boolean;
}

export const WorkMaterialRelationsTable = ({
  materialId,
  workId,
  canManage,
}: WorkMaterialRelationsTableProps) => {
  const [form] = Form.useForm<{
    work?: string;
    material?: string;
    quantity: number;
  }>();
  const [modalOpen, setModalOpen] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [editingRecord, setEditingRecord] =
    React.useState<IWorkMaterialRelationsListColumn | null>(null);
  const notificationApi = React.useContext(NotificationContext);

  const isMaterialContext = Boolean(materialId);
  const relationsParams = React.useMemo(() => {
    if (materialId) return { material: materialId };
    if (workId) return { work: workId };
    return undefined;
  }, [materialId, workId]);

  const {
    data: relations = [],
    isPending,
    isFetching,
  } = useWorkMaterialRelationsQuery(relationsParams, {
    enabled: Boolean(relationsParams),
  });

  const createRelationMutation = useCreateWorkMaterialRelationMutation();
  const updateRelationMutation = useUpdateWorkMaterialRelationMutation();
  const deleteRelationMutation = useDeleteWorkMaterialRelationMutation();

  const relationsData: IWorkMaterialRelationsListColumn[] = React.useMemo(
    () =>
      (relations ?? []).map((doc) => ({
        ...doc,
        key: doc.work_material_relation_id,
      })),
    [relations],
  );

  const { works, worksMap } = useWorksMap();
  const { materials, materialsMap } = useMaterialsMap();

  const worksOptions = React.useMemo(
    () =>
      works
        .filter((work) => Boolean(work.work_id))
        .map((work) => ({
          label: work.name,
          value: work.work_id as string,
          deleted: work.deleted,
        })),
    [works],
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

  const rawOptions = isMaterialContext ? worksOptions : materialsOptions;
  const selectableOptions = React.useMemo(
    () => rawOptions.filter((option) => !option.deleted),
    [rawOptions],
  );
  const relationField = isMaterialContext ? "work" : "material";
  const relationTitle = isMaterialContext ? "Работа" : "Материал";

  const openCreateModal = () => {
    const resolvedMaterialId = materialId ?? undefined;
    const resolvedWorkId = workId ?? undefined;

    if (!resolvedMaterialId && !resolvedWorkId) {
      return;
    }

    setEditingRecord(null);
    form.resetFields();
    form.setFieldsValue({
      material: resolvedMaterialId,
      work: resolvedWorkId,
      quantity: 0,
    });
    setModalOpen(true);
  };

  const openEditModal = (record: IWorkMaterialRelationsListColumn) => {
    setEditingRecord(record);
    form.setFieldsValue({
      material: record.material,
      work: record.work,
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
      const resolvedMaterialId = materialId ?? rowData.material;
      const resolvedWorkId = workId ?? rowData.work;

      if (!resolvedMaterialId) {
        throw new Error("Не удалось определить материал");
      }
      if (!resolvedWorkId) {
        throw new Error("Не удалось определить работу");
      }

      const row = {
        quantity: Number(rowData.quantity),
        material: resolvedMaterialId,
        work: resolvedWorkId,
      };

      setSaving(true);
      if (editingRecord) {
        if (!editingRecord.work_material_relation_id) {
          throw new Error("Не удалось определить запись");
        }
        await updateRelationMutation.mutateAsync({
          relationId: editingRecord.work_material_relation_id,
          payload: row,
        });
        notificationApi?.success({
          message: "Успешно",
          description: "Запись обновлена",
          placement: "bottomRight",
          duration: 2,
        });
      } else {
        await createRelationMutation.mutateAsync(row);
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

  const handleDeleteRelation = async (key: string) => {
    const resolvedMaterialId = materialId ?? undefined;
    const resolvedWorkId = workId ?? undefined;
    try {
      await deleteRelationMutation.mutateAsync({
        relationId: key,
        materialId: resolvedMaterialId,
        workId: resolvedWorkId,
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
      title: relationTitle,
      dataIndex: relationField,
      key: relationField,
      render: (value: string) => {
        if (relationField === "work") {
          return worksMap[value]?.name ?? value;
        }
        return materialsMap[value]?.name ?? value;
      },
    },
    {
      title: "Количество на 1 ед. работы",
      dataIndex: "quantity",
      key: "quantity",
    },
    {
      title: "Действия",
      dataIndex: "operation",
      hidden: !canManage,
      width: !isMobile() && "116px",
      render: (_: string, record: IWorkMaterialRelationsListColumn) => {
        return (
          <Space>
            <Button
              icon={<EditTwoTone twoToneColor="#e40808" />}
              type="link"
              onClick={() => openEditModal(record)}
            />
            <Popconfirm
              title="Удалить?"
              onConfirm={() => handleDeleteRelation(record.key)}
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
          type="primary"
          className="work-material-relations__add-button"
        >
          Добавить расход материала
        </Button>
      )}

      <Table
        pagination={false}
        bordered={!isMobile()}
        dataSource={relationsData}
        columns={tableColumns}
        loading={isPending || isFetching}
      />
      <Modal
        title={
          editingRecord
            ? "Редактирование расхода материала"
            : "Добавление расхода материала"
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
            label={relationTitle}
            name={relationField}
            rules={[{ required: true, message: `Выберите ${relationTitle.toLowerCase()}` }]}
          >
            <Select
              showSearch
              filterOption={selectFilterHandler}
              options={selectableOptions}
            />
          </Form.Item>
          <Form.Item
            label="Количество на 1 ед. работы"
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
