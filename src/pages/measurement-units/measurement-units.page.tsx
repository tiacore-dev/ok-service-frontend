import * as React from "react";
import {
  Breadcrumb,
  Button,
  Form,
  Input,
  Layout,
  Modal,
  Popconfirm,
  Space,
  Table,
  Typography,
} from "antd";
import { DeleteTwoTone, EditTwoTone } from "@ant-design/icons";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { getCurrentRole } from "../../store/modules/auth";
import { RoleId } from "../../interfaces/roles/IRole";
import { isMobile } from "../../utils/isMobile";
import { NotificationContext } from "../../contexts/NotificationContext";
import type { IMeasurementUnit } from "../../interfaces/measurementUnits/IMeasurementUnit";
import {
  useCreateMeasurementUnitMutation,
  useDeleteMeasurementUnitMutation,
  useMeasurementUnitsQuery,
  useUpdateMeasurementUnitMutation,
} from "../../queries/measurementUnits";
import "./measurement-units.page.less";

interface MeasurementUnitFormValues {
  name: string;
}

export const MeasurementUnits = () => {
  const { Content } = Layout;
  const currentRole = useSelector(getCurrentRole);
  const isAdmin = currentRole === RoleId.ADMIN;
  const [form] = Form.useForm<MeasurementUnitFormValues>();
  const [modalOpen, setModalOpen] = React.useState(false);
  const [editingRecord, setEditingRecord] =
    React.useState<IMeasurementUnit | null>(null);
  const notificationApi = React.useContext(NotificationContext);
  const {
    data: measurementUnits = [],
    isPending,
    isFetching,
  } = useMeasurementUnitsQuery({ enabled: isAdmin });
  const createMeasurementUnitMutation = useCreateMeasurementUnitMutation();
  const updateMeasurementUnitMutation = useUpdateMeasurementUnitMutation();
  const deleteMeasurementUnitMutation = useDeleteMeasurementUnitMutation();

  const openCreateModal = () => {
    setEditingRecord(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEditModal = (record: IMeasurementUnit) => {
    setEditingRecord(record);
    form.setFieldsValue({ name: record.name });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingRecord(null);
    form.resetFields();
  };

  const save = async () => {
    try {
      const values = await form.validateFields();
      const payload = { name: values.name.trim() };
      if (editingRecord) {
        await updateMeasurementUnitMutation.mutateAsync({
          measurementUnitId: editingRecord.measurement_unit_id,
          payload,
        });
      } else {
        await createMeasurementUnitMutation.mutateAsync(payload);
      }
      notificationApi?.success({
        message: "Успешно",
        description: editingRecord
          ? "Единица измерения изменена"
          : "Единица измерения создана",
        placement: "bottomRight",
        duration: 2,
      });
      closeModal();
    } catch (error) {
      const description =
        error instanceof Error
          ? error.message
          : "Не удалось сохранить единицу измерения";
      notificationApi?.error({
        message: "Ошибка",
        description,
        placement: "bottomRight",
        duration: 2,
      });
    }
  };

  const handleDelete = async (measurementUnitId: string) => {
    try {
      await deleteMeasurementUnitMutation.mutateAsync(measurementUnitId);
      notificationApi?.success({
        message: "Удалено",
        description: "Единица измерения удалена",
        placement: "bottomRight",
        duration: 2,
      });
    } catch (error) {
      const description =
        error instanceof Error
          ? error.message
          : "Не удалось удалить единицу измерения";
      notificationApi?.error({
        message: "Ошибка",
        description,
        placement: "bottomRight",
        duration: 2,
      });
    }
  };

  const columns = [
    { title: "Наименование", dataIndex: "name", key: "name" },
    {
      title: "Действия",
      key: "actions",
      width: !isMobile() && "116px",
      render: (_: unknown, record: IMeasurementUnit) => (
        <Space>
          <Button
            type="link"
            icon={<EditTwoTone twoToneColor="#e40808" />}
            onClick={() => openEditModal(record)}
          />
          <Popconfirm
            title="Удалить единицу измерения?"
            okText="Удалить"
            cancelText="Отмена"
            onConfirm={() => handleDelete(record.measurement_unit_id)}
          >
            <Button
              type="link"
              icon={<DeleteTwoTone twoToneColor="#e40808" />}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Breadcrumb
        className="breadcrumb"
        items={[
          { title: <Link to="/home">Главная</Link> },
          { title: <Link to="/works">Работы</Link> },
          { title: "Единицы измерения" },
        ]}
      />
      <Content className="measurement-units__content">
        {!isAdmin ? (
          <Typography.Text>
            Раздел доступен только администратору.
          </Typography.Text>
        ) : (
          <>
            <Button
              type="primary"
              className="measurement-units__add-button"
              onClick={openCreateModal}
            >
              Добавить единицу измерения
            </Button>
            <Table
              rowKey="measurement_unit_id"
              bordered={!isMobile()}
              pagination={false}
              dataSource={measurementUnits}
              columns={columns}
              loading={isPending || isFetching}
            />
          </>
        )}
      </Content>
      <Modal
        title={
          editingRecord
            ? "Редактирование единицы измерения"
            : "Создание единицы измерения"
        }
        open={modalOpen}
        onOk={save}
        onCancel={closeModal}
        confirmLoading={
          createMeasurementUnitMutation.isPending ||
          updateMeasurementUnitMutation.isPending
        }
        okText="Сохранить"
        cancelText="Отмена"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Наименование"
            name="name"
            rules={[
              {
                required: true,
                whitespace: true,
                message: "Введите наименование",
              },
            ]}
          >
            <Input autoFocus />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};
