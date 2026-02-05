import * as React from "react";
import { Button, Form, Popconfirm, Space, Table } from "antd";
import {
  CheckCircleTwoTone,
  CloseCircleTwoTone,
  DeleteTwoTone,
  EditTwoTone,
} from "@ant-design/icons";
import { isMobile } from "../../utils/isMobile";
import { EditableCell } from "../components/editableCell";
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
import { IProjectMaterial } from "../../interfaces/projectMaterials/IProjectMaterial";

interface ProjectMaterialsTableProps {
  projectId: string;
  canManage: boolean;
}

interface CreatebleProjectMaterial
  extends Omit<IProjectMaterial, "project_material_id"> {
  key: string;
}

export const ProjectMaterialsTable = ({
  projectId,
  canManage,
}: ProjectMaterialsTableProps) => {
  const [form] = Form.useForm<IProjectMaterialsListColumn>();
  const [editingKey, setEditingKey] = React.useState("");
  const [newRecordKey, setNewRecordKey] = React.useState("");
  const [actualData, setActualData] = React.useState(false);
  const [dataSource, setDataSource] = React.useState<
    IProjectMaterialsListColumn[]
  >([]);
  const notificationApi = React.useContext(NotificationContext);

  const {
    data: projectMaterials = [],
    isPending,
    isFetching,
  } = useProjectMaterialsQuery(projectId, { enabled: Boolean(projectId) });
  const { materials } = useMaterialsMap();
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

  React.useEffect(() => {
    if (!isPending && !isFetching) {
      setDataSource(projectMaterialsData);
      if (!actualData) {
        setActualData(true);
      }
    }
  }, [projectMaterialsData, isPending, isFetching]);

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

  const options = materialsOptions.length > 0 ? materialsOptions : undefined;

  const isEditing = (record: IProjectMaterialsListColumn) =>
    record.key === editingKey;
  const isCreating = (record: IProjectMaterialsListColumn) =>
    record.key === newRecordKey;

  const edit = (record: IProjectMaterialsListColumn) => {
    form.setFieldsValue({ ...record });
    setEditingKey(record.key);
    if (newRecordKey) {
      setDataSource(projectMaterialsData);
      setNewRecordKey("");
    }
  };

  const cancel = () => {
    setEditingKey("");
    setNewRecordKey("");
    setDataSource(projectMaterialsData);
  };

  const save = async (key: string) => {
    try {
      const rowData = await form.validateFields();
      const newData = [...dataSource];
      const index = newData.findIndex((item) => key === item.key);

      if (index > -1) {
        const item = newData[index];
        const resolvedMaterialId = rowData.material ?? item.material;

        if (!projectId) {
          throw new Error("Не удалось определить спецификацию");
        }
        if (!resolvedMaterialId) {
          throw new Error("Не удалось определить материал");
        }

        const payload = {
          project: projectId,
          material: resolvedMaterialId,
          quantity: Number(rowData.quantity),
          project_work: item.project_work ?? null,
        };

        if (isCreating(item)) {
          setActualData(false);
          setNewRecordKey("");
          await createProjectMaterialMutation.mutateAsync({
            ...payload,
            project_work: null,
          });
          notificationApi?.success({
            message: "Успешно",
            description: "Запись добавлена",
            placement: "bottomRight",
            duration: 2,
          });
        } else {
          if (!item.project_material_id) {
            throw new Error("Не удалось определить запись");
          }
          setActualData(false);
          setEditingKey("");
          await updateProjectMaterialMutation.mutateAsync({
            projectMaterialId: item.project_material_id,
            payload,
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
    if (!projectId || newRecordKey) {
      return;
    }

    const newData: CreatebleProjectMaterial = {
      key: "new",
      project: projectId,
      material: "",
      quantity: 0,
      project_work: null,
    };
    setDataSource([newData, ...dataSource]);
    setNewRecordKey("new");
    setEditingKey("");
    form.setFieldsValue({ ...newData });
  };

  const handleDeleteProjectMaterial = async (projectMaterialId?: string) => {
    if (!projectId || !projectMaterialId) return;
    try {
      setActualData(false);
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
      inputType: "text",
      type: "select",
      options,
      dataIndex: "material",
      key: "material",
      editable: true,
      required: true,
    },
    {
      title: "Количество",
      inputType: "number",
      dataIndex: "quantity",
      key: "quantity",
      editable: true,
      required: true,
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

  const mergedColumns = columns.map((col) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record: IProjectMaterialsListColumn) => ({
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
          Добавить материал
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
