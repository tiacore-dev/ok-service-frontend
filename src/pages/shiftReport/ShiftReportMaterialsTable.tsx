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
import { useProjectMaterialsQuery } from "../../queries/projectMaterials";
import { useProjectWorksMap } from "../../queries/projectWorks";
import { NotificationContext } from "../../contexts/NotificationContext";
import { selectFilterHandler } from "../../utils/selectFilterHandler";
import "./ShiftReportMaterialsTable.less";
import type { IProjectMaterialStat } from "../../interfaces/projects/IProjectStat";

interface ShiftReportMaterialsTableProps {
  shiftReportId: string;
  projectId: string;
  canManage: boolean;
  showCheck: boolean;
  materialStats?: Record<string, IProjectMaterialStat>;
}

export const ShiftReportMaterialsTable = ({
  shiftReportId,
  projectId,
  canManage,
  showCheck,
  materialStats,
}: ShiftReportMaterialsTableProps) => {
  const [form] = Form.useForm<{
    project_material: string;
    quantity: number;
  }>();
  const [modalOpen, setModalOpen] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [editingRecord, setEditingRecord] =
    React.useState<IShiftReportMaterialsListColumn | null>(null);
  const notificationApi = React.useContext(NotificationContext);

  const { data: shiftReportMaterials = [], isLoading } =
    useShiftReportMaterialsQuery(shiftReportId);
  const { materialsMap } = useMaterialsMap();
  const { data: projectMaterials = [], isPending: isProjectMaterialsPending } =
    useProjectMaterialsQuery(projectId, { enabled: Boolean(projectId) });
  const { projectWorksMap } = useProjectWorksMap(projectId, {
    enabled: Boolean(projectId),
  });
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
            `${doc.shift_report}-${doc.project_material}-${doc.shift_report_detail ?? "manual"}`,
        })),
      [shiftReportMaterials],
    );

  const projectMaterialsMap = React.useMemo(
    () =>
      projectMaterials.reduce<
        Record<string, (typeof projectMaterials)[number]>
      >((map, projectMaterial) => {
        if (projectMaterial.project_material_id) {
          map[projectMaterial.project_material_id] = projectMaterial;
        }
        return map;
      }, {}),
    [projectMaterials],
  );

  const reportQuantityByMaterial = React.useMemo(
    () =>
      shiftReportMaterials.reduce<Record<string, number>>((quantities, row) => {
        const materialId = projectMaterialsMap[row.project_material]?.material;
        if (materialId) {
          quantities[materialId] =
            (quantities[materialId] ?? 0) + Number(row.quantity);
        }
        return quantities;
      }, {}),
    [projectMaterialsMap, shiftReportMaterials],
  );

  const projectMaterialsOptions = React.useMemo(
    () =>
      projectMaterials
        .filter((projectMaterial) =>
          Boolean(projectMaterial.project_material_id),
        )
        .map((projectMaterial) => ({
          label: `${projectMaterial.project_material_name ?? "Без наименования"} — ${materialsMap[projectMaterial.material]?.name ?? projectMaterial.material}`,
          value: projectMaterial.project_material_id as string,
        })),
    [materialsMap, projectMaterials],
  );

  const openCreateModal = () => {
    if (!shiftReportId) return;
    setEditingRecord(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEditModal = (record: IShiftReportMaterialsListColumn) => {
    setEditingRecord(record);
    form.setFieldsValue({
      project_material: record.project_material,
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
      if (!rowData.project_material) {
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
            project_material: rowData.project_material,
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
          project_material: rowData.project_material,
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

  const renderProjectWork = (projectMaterialId: string) => {
    const projectWorkId = projectMaterialsMap[projectMaterialId]?.project_work;
    return projectWorkId
      ? projectWorksMap[projectWorkId]?.project_work_name ?? "—"
      : "—";
  };

  const columns = [
    {
      title: "Материал",
      dataIndex: "project_material",
      key: "project_material",
      render: (projectMaterialId: string) => {
        const projectMaterial = projectMaterialsMap[projectMaterialId];
        return projectMaterial
          ? materialsMap[projectMaterial.material]?.name ??
              projectMaterial.material
          : "—";
      },
    },
    {
      title: "Наименование в спецификации",
      dataIndex: "project_material",
      key: "project_material_name",
      render: (projectMaterialId: string) =>
        projectMaterialsMap[projectMaterialId]?.project_material_name ?? "—",
    },
    {
      title: "Количество",
      dataIndex: "quantity",
      key: "quantity",
    },
    {
      title: "Работа",
      dataIndex: "project_material",
      key: "shift_report_detail",
      render: renderProjectWork,
    },
    {
      title: "Проверка",
      key: "check",
      hidden: !showCheck,
      render: (_: unknown, record: IShiftReportMaterialsListColumn) => {
        const materialId = projectMaterialsMap[record.project_material]?.material;
        const stat = materialId ? materialStats?.[materialId] : undefined;
        if (!stat) return "—";
        const available =
          stat.project_material_quantity - stat.shift_report_material_quantity;
        return (
          <span
            className={
              available < reportQuantityByMaterial[materialId]
                ? "shift-report__blocked-text"
                : undefined
            }
          >
            {`Израсходовано: ${stat.shift_report_material_quantity} из ${stat.project_material_quantity} Доступно: ${Math.max(available, 0)}`}
          </span>
        );
      },
    },
    {
      title: "Действия",
      dataIndex: "operation",
      hidden: !canManage,
      width: isMobile() ? undefined : "116px",
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
  const tableColumns = columns.filter((col) => !col.hidden);

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
        loading={isLoading || isProjectMaterialsPending}
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
            label="Материал из спецификации"
            name="project_material"
            rules={[
              {
                required: true,
                message: "Выберите материал из спецификации",
              },
            ]}
          >
            <Select
              showSearch
              filterOption={selectFilterHandler}
              loading={isProjectMaterialsPending}
              options={projectMaterialsOptions}
            />
          </Form.Item>
          <Form.Item
            label="Количество"
            name="quantity"
            rules={[
              {
                validator: (_, value) =>
                  typeof value === "number" && value > 0
                    ? Promise.resolve()
                    : Promise.reject(
                        new Error("Укажите количество больше нуля"),
                      ),
              },
            ]}
          >
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};
