import * as React from "react";
import { Button, Form, Popconfirm, Space, Table } from "antd";
import {
  CheckCircleTwoTone,
  CloseCircleTwoTone,
  DeleteTwoTone,
  EditTwoTone,
  PlusCircleTwoTone,
} from "@ant-design/icons";
import { isMobile } from "../../utils/isMobile";
import { EditableCell } from "../components/editableCell";
import type { IShiftReportMaterialsListColumn } from "../../interfaces/shiftReportMaterials/IShiftReportMaterialsList";
import {
  useCreateShiftReportMaterialMutation,
  useDeleteShiftReportMaterialMutation,
  useEditShiftReportMaterialMutation,
} from "../../hooks/QueryActions/shift-reports/shift-reports-materials/shift-report-materials.mutations";
import { useShiftReportMaterialsQuery } from "../../hooks/QueryActions/shift-reports/shift-reports-materials/shift-report-materials.query";
import { useMaterialsMap } from "../../queries/materials";
import { useShiftReportDetailsQuery } from "../../hooks/QueryActions/shift-reports/shift-reports-details/shift-report-details.query";
import { useWorksMap } from "../../queries/works";
import { NotificationContext } from "../../contexts/NotificationContext";
import type { IShiftReportDetailsList } from "../../interfaces/shiftReportDetails/IShiftReportDetailsList";
import { IShiftReportMaterial } from "../../interfaces/shiftReportMaterials/IShiftReportMaterial";
import "./ShiftReportMaterialsTable.less";

interface ShiftReportMaterialsTableProps {
  shiftReportId: string;
  canManage: boolean;
}

interface CreatebleShiftReportMaterial
  extends Omit<IShiftReportMaterial, "shift_report_material_id"> {
  key: string;
}

export const ShiftReportMaterialsTable = ({
  shiftReportId,
  canManage,
}: ShiftReportMaterialsTableProps) => {
  const [form] = Form.useForm<IShiftReportMaterialsListColumn>();
  const [editingKey, setEditingKey] = React.useState("");
  const [newRecordKey, setNewRecordKey] = React.useState("");
  const [actualData, setActualData] = React.useState(false);
  const [dataSource, setDataSource] = React.useState<
    IShiftReportMaterialsListColumn[]
  >([]);
  const notificationApi = React.useContext(NotificationContext);

  const { data: shiftReportMaterials = [], isLoading } =
    useShiftReportMaterialsQuery(shiftReportId);
  const { data: shiftReportDetails = [] } =
    useShiftReportDetailsQuery(shiftReportId);
  const { materials } = useMaterialsMap();
  const { worksMap } = useWorksMap();
  const createShiftReportMaterialMutation =
    useCreateShiftReportMaterialMutation();
  const editShiftReportMaterialMutation = useEditShiftReportMaterialMutation();
  const deleteShiftReportMaterialMutation =
    useDeleteShiftReportMaterialMutation();

  const shiftReportMaterialsData: IShiftReportMaterialsListColumn[] =
    React.useMemo(
      () =>
        (shiftReportMaterials ?? []).map((doc) => ({
          ...doc,
          key:
            doc.shift_report_material_id ??
            `${doc.shift_report}-${doc.material}-${doc.shift_report_detail ?? "manual"}`,
        })),
      [shiftReportMaterials],
    );

  React.useEffect(() => {
    if (!isLoading) {
      setDataSource(shiftReportMaterialsData);
      if (!actualData) {
        setActualData(true);
      }
    }
  }, [shiftReportMaterialsData, isLoading]);

  const detailsMap = React.useMemo(
    () =>
      (shiftReportDetails ?? []).reduce<
        Record<string, IShiftReportDetailsList>
      >((acc, detail) => {
        if (detail.shift_report_detail_id) {
          acc[detail.shift_report_detail_id] = detail;
        }
        return acc;
      }, {}),
    [shiftReportDetails],
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

  const options = materialsOptions.length > 0 ? materialsOptions : undefined;

  const isEditing = (record: IShiftReportMaterialsListColumn) =>
    record.key === editingKey;
  const isCreating = (record: IShiftReportMaterialsListColumn) =>
    record.key === newRecordKey;

  const edit = (record: IShiftReportMaterialsListColumn) => {
    form.setFieldsValue({ ...record });
    setEditingKey(record.key);
    if (newRecordKey) {
      setDataSource(shiftReportMaterialsData);
      setNewRecordKey("");
    }
  };

  const cancel = () => {
    setEditingKey("");
    setNewRecordKey("");
    setDataSource(shiftReportMaterialsData);
  };

  const save = async (key: string) => {
    try {
      const rowData = await form.validateFields();
      const newData = [...dataSource];
      const index = newData.findIndex((item) => key === item.key);

      if (index > -1) {
        const item = newData[index];
        const resolvedMaterialId = rowData.material ?? item.material;

        if (!shiftReportId) {
          throw new Error("Не удалось определить отчет");
        }
        if (!resolvedMaterialId) {
          throw new Error("Не удалось определить материал");
        }

        const payload = {
          shift_report: shiftReportId,
          material: resolvedMaterialId,
          quantity: Number(rowData.quantity),
          shift_report_detail: item.shift_report_detail ?? null,
        };

        if (isCreating(item)) {
          setActualData(false);
          setNewRecordKey("");
          await createShiftReportMaterialMutation.mutateAsync({
            ...payload,
            shift_report_detail: null,
          });
          notificationApi?.success({
            message: "Успешно",
            description: "Запись добавлена",
            placement: "bottomRight",
            duration: 2,
          });
        } else {
          if (!item.shift_report_material_id) {
            throw new Error("Не удалось определить запись");
          }
          setActualData(false);
          setEditingKey("");
          await editShiftReportMaterialMutation.mutateAsync({
            id: item.shift_report_material_id,
            data: payload,
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
    if (!shiftReportId || newRecordKey) {
      return;
    }

    const newData: CreatebleShiftReportMaterial = {
      key: "new",
      shift_report: shiftReportId,
      material: "",
      quantity: 0,
      shift_report_detail: null,
    };
    setDataSource([newData, ...dataSource]);
    setNewRecordKey("new");
    setEditingKey("");
    form.setFieldsValue({ ...newData });
  };

  const handleDeleteShiftReportMaterial = async (
    shiftReportMaterialId?: string,
  ) => {
    if (!shiftReportId || !shiftReportMaterialId) return;
    try {
      setActualData(false);
      await deleteShiftReportMaterialMutation.mutateAsync({
        id: shiftReportMaterialId,
        shiftReportId,
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

  const renderSource = (value: string | null) => {
    if (!value) {
      return "—";
    }
    const detail = detailsMap[value];
    if (!detail) {
      return "—";
    }
    const projectWorkName = detail.project_work?.name ?? "";
    const workName = worksMap[detail.work]?.name ?? "";
    return [projectWorkName, workName].filter(Boolean).join(" / ") || "—";
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
      dataIndex: "shift_report_detail",
      key: "shift_report_detail",
      render: renderSource,
    },
    {
      title: "Действия",
      dataIndex: "operation",
      hidden: !canManage,
      width: !isMobile() && "116px",
      render: (_: string, record: IShiftReportMaterialsListColumn) => {
        const editable = isEditing(record) || isCreating(record);
        return editable ? (
          <span>
            <Button
              onClick={() => save(record.key)}
              className="shift-report-materials__action-button"
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
                handleDeleteShiftReportMaterial(record.shift_report_material_id)
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
      onCell: (record: IShiftReportMaterialsListColumn) => ({
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
        <Button
          onClick={handleAdd}
          type="default"
          icon={<PlusCircleTwoTone twoToneColor="#ff1616" />}
          className="shift-report-materials__add-button"
        >
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
          loading={isLoading}
          className="shift-report__materials-table"
        />
      </Form>
    </>
  );
};
