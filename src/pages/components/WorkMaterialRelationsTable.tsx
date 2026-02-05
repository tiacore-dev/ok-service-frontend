import * as React from "react";
import { Button, Form, Popconfirm, Space, Table } from "antd";
import {
  CheckCircleTwoTone,
  CloseCircleTwoTone,
  DeleteTwoTone,
  EditTwoTone,
} from "@ant-design/icons";
import { isMobile } from "../../utils/isMobile";
import { EditableCell } from "./editableCell";
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
  const [form] = Form.useForm<IWorkMaterialRelationsListColumn>();
  const [editingKey, setEditingKey] = React.useState("");
  const [newRecordKey, setNewRecordKey] = React.useState("");
  const [actualData, setActualData] = React.useState(false);
  const [dataSource, setDataSource] = React.useState<
    IWorkMaterialRelationsListColumn[]
  >([]);
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

  const { works } = useWorksMap();
  const { materials } = useMaterialsMap();
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

  React.useEffect(() => {
    if (!isPending && !isFetching) {
      setDataSource(relationsData);
      if (!actualData) {
        setActualData(true);
      }
    }
  }, [relationsData, isPending, isFetching]);

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
  const options = rawOptions.length > 0 ? rawOptions : undefined;
  const relationField = isMaterialContext ? "work" : "material";
  const relationTitle = isMaterialContext ? "Работа" : "Материал";

  const isEditing = (record: IWorkMaterialRelationsListColumn) =>
    record.key === editingKey;
  const isCreating = (record: IWorkMaterialRelationsListColumn) =>
    record.key === newRecordKey;

  const edit = (record: IWorkMaterialRelationsListColumn) => {
    form.setFieldsValue({ ...record });
    setEditingKey(record.key);
    if (newRecordKey) {
      setDataSource(relationsData);
      setNewRecordKey("");
    }
  };

  const cancel = () => {
    setEditingKey("");
    setNewRecordKey("");
    setDataSource(relationsData);
  };

  const save = async (key: string) => {
    try {
      const rowData = await form.validateFields();
      const newData = [...dataSource];
      const index = newData.findIndex((item) => key === item.key);

      if (index > -1) {
        const item = newData[index];
        const resolvedMaterialId = materialId ?? rowData.material;
        const resolvedWorkId = workId ?? rowData.work;

        if (!resolvedMaterialId) {
          throw new Error("Не удалось определить материал");
        }
        if (!resolvedWorkId) {
          throw new Error("Не удалось определить работу");
        }

        const row = {
          ...rowData,
          quantity: Number(rowData.quantity),
          material: resolvedMaterialId,
          work: resolvedWorkId,
        };

        if (isCreating(item)) {
          setActualData(false);
          setNewRecordKey("");
          await createRelationMutation.mutateAsync(row);
          notificationApi?.success({
            message: "Успешно",
            description: "Запись добавлена",
            placement: "bottomRight",
            duration: 2,
          });
        } else {
          if (!item.work_material_relation_id) {
            throw new Error("Не удалось определить запись");
          }
          setActualData(false);
          setEditingKey("");
          await updateRelationMutation.mutateAsync({
            relationId: item.work_material_relation_id,
            payload: row,
          });
          notificationApi?.success({
            message: "Успешно",
            description: "Запись обновлена",
            placement: "bottomRight",
            duration: 2,
          });
        }
      }
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
    }
  };

  const handleAdd = () => {
    if (!newRecordKey) {
      const resolvedMaterialId = materialId ?? "";
      const resolvedWorkId = workId ?? "";

      if (!resolvedMaterialId && !resolvedWorkId) {
        return;
      }

      const newData = {
        key: "new",
        material: resolvedMaterialId,
        work: resolvedWorkId,
        quantity: 0,
      };
      setDataSource([newData, ...dataSource]);
      setNewRecordKey("new");
      setEditingKey("");
      form.setFieldsValue({ ...newData });
    }
  };

  const handleDeleteRelation = async (key: string) => {
    const resolvedMaterialId = materialId ?? undefined;
    const resolvedWorkId = workId ?? undefined;
    try {
      setActualData(false);
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
      inputType: "text",
      type: "select",
      options,
      dataIndex: relationField,
      key: relationField,
      editable: true,
      required: true,
    },
    {
      title: "Количество на 1 ед. работы",
      inputType: "number",
      dataIndex: "quantity",
      key: "quantity",
      editable: true,
      required: true,
    },
    {
      title: "Действия",
      dataIndex: "operation",
      hidden: !canManage,
      width: !isMobile() && "116px",
      render: (_: string, record: IWorkMaterialRelationsListColumn) => {
        const editable = isEditing(record) || isCreating(record);
        return editable ? (
          <span>
            <Button
              onClick={() => save(record.key)}
              style={{ marginRight: 8 }}
              icon={<CheckCircleTwoTone twoToneColor="#52c41a" />}
            />
            <Button
              icon={<CloseCircleTwoTone twoToneColor="#e40808" />}
              onClick={cancel}
            ></Button>
          </span>
        ) : (
          <Space>
            <Button
              icon={<EditTwoTone twoToneColor="#e40808" />}
              type="link"
              onClick={() => edit(record)}
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

  const mergedColumns = columns.map((col) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record: IWorkMaterialRelationsListColumn) => ({
        record,
        inputType: col.inputType,
        dataIndex: col.dataIndex,
        title: col.title,
        "data-label": col.title,
        editing: isEditing(record) || isCreating(record),
        type: col.type,
        options: col.options,
        required: col.required,
      }),
    };
  });
  const tableColumns = canManage
    ? mergedColumns
    : mergedColumns.filter((col) => !col.hidden);

  return (
    <>
      {canManage && (
        <Button onClick={handleAdd} type="primary" style={{ marginBottom: 16 }}>
          Добавить расход материала
        </Button>
      )}

      <Form form={form} component={false}>
        <Table
          pagination={false}
          bordered={!isMobile()}
          components={{
            body: {
              cell: EditableCell,
            },
          }}
          dataSource={dataSource}
          columns={tableColumns}
          loading={isPending || isFetching}
        />
      </Form>
    </>
  );
};
