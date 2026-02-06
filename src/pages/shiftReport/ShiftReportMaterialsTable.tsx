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
  PlusCircleTwoTone,
} from "@ant-design/icons";
import { isMobile } from "../../utils/isMobile";
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
import { selectFilterHandler } from "../../utils/selectFilterHandler";
import "./ShiftReportMaterialsTable.less";

interface ShiftReportMaterialsTableProps {
  shiftReportId: string;
  canManage: boolean;
}

export const ShiftReportMaterialsTable = ({
  shiftReportId,
  canManage,
}: ShiftReportMaterialsTableProps) => {
  const [form] = Form.useForm<{ material: string; quantity: number }>();
  const [modalOpen, setModalOpen] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [editingRecord, setEditingRecord] =
    React.useState<IShiftReportMaterialsListColumn | null>(null);
  const notificationApi = React.useContext(NotificationContext);

  const { data: shiftReportMaterials = [], isLoading } =
    useShiftReportMaterialsQuery(shiftReportId);
  const { data: shiftReportDetails = [] } =
    useShiftReportDetailsQuery(shiftReportId);
  const { materials, materialsMap } = useMaterialsMap();
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

  const selectableMaterialsOptions = React.useMemo(
    () => materialsOptions.filter((option) => !option.deleted),
    [materialsOptions],
  );

  const openCreateModal = () => {
    if (!shiftReportId) return;
    setEditingRecord(null);
    form.resetFields();
    form.setFieldsValue({ quantity: 0 });
    setModalOpen(true);
  };

  const openEditModal = (record: IShiftReportMaterialsListColumn) => {
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
      if (!shiftReportId) {
        throw new Error("Не удалось определить отчет");
      }
      if (!rowData.material) {
        throw new Error("Не удалось определить материал");
      }

      setSaving(true);
      if (editingRecord) {
        if (!editingRecord.shift_report_material_id) {
          throw new Error("Не удалось определить запись");
        }
        await editShiftReportMaterialMutation.mutateAsync({
          id: editingRecord.shift_report_material_id,
          data: {
            shift_report: shiftReportId,
            material: rowData.material,
            quantity: Number(rowData.quantity),
            shift_report_detail: editingRecord.shift_report_detail ?? null,
          },
        });
        notificationApi?.success({
          message: "Успешно",
          description: "Запись обновлена",
          placement: "bottomRight",
          duration: 2,
        });
      } else {
        await createShiftReportMaterialMutation.mutateAsync({
          shift_report: shiftReportId,
          material: rowData.material,
          quantity: Number(rowData.quantity),
          shift_report_detail: null,
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

  const handleDeleteShiftReportMaterial = async (
    shiftReportMaterialId?: string,
  ) => {
    if (!shiftReportId || !shiftReportMaterialId) return;
    try {
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
          className="shift-report-materials__add-button"
        >
          Добавить материал
        </Button>
      )}

      <Table
        pagination={false}
        bordered={!isMobile()}
        dataSource={shiftReportMaterialsData}
        columns={tableColumns}
        loading={isLoading}
        className="shift-report__materials-table"
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
