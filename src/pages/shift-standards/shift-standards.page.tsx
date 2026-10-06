import * as React from "react";
import {
  Alert,
  Breadcrumb,
  Button,
  Form,
  Input,
  InputNumber,
  Layout,
  Modal,
  Popconfirm,
  Select,
  Space,
  Spin,
  Table,
  Typography,
} from "antd";
import {
  DeleteTwoTone,
  EditTwoTone,
  PlusCircleTwoTone,
} from "@ant-design/icons";
import { Link } from "react-router-dom";
import {
  useCreateShiftStandardMutation,
  useDeleteShiftStandardMutation,
  useShiftStandardsQuery,
  useUpdateShiftStandardMutation,
} from "../../queries/shiftStandards";
import { categoryMap } from "../../utils/categoryMap";
import { NotificationContext } from "../../contexts/NotificationContext";
import "./shift-standards.page.less";
import { getApiErrorMessage } from "../../utils/getApiErrorMessage";
import { dateTimestampToLocalDateTimeString } from "../../utils/dateConverter";
import type { IShiftStandard } from "../../interfaces/shiftStandards/IShiftStandard";

interface ShiftStandardFormValues {
  category: number;
  standard: number;
  notification_text?: string;
}

const allowedIntegerKeys = new Set([
  "Backspace",
  "Delete",
  "Tab",
  "ArrowLeft",
  "ArrowRight",
  "Home",
  "End",
]);

export const ShiftStandards = () => {
  const { Content } = Layout;
  const [form] = Form.useForm<ShiftStandardFormValues>();
  const {
    data: shiftStandards = [],
    isPending,
    isFetching,
    isError,
  } = useShiftStandardsQuery();
  const [isCreateModalOpen, setCreateModalOpen] = React.useState(false);
  const [editingStandard, setEditingStandard] =
    React.useState<IShiftStandard | null>(null);
  const [notificationSearch, setNotificationSearch] = React.useState("");
  const [standardSearch, setStandardSearch] = React.useState<number>();
  const [category, setCategory] = React.useState<number>();
  const notificationApi = React.useContext(NotificationContext);
  const createShiftStandardMutation = useCreateShiftStandardMutation();
  const updateShiftStandardMutation = useUpdateShiftStandardMutation();
  const deleteShiftStandardMutation = useDeleteShiftStandardMutation();

  const closeCreateModal = () => {
    setCreateModalOpen(false);
    setEditingStandard(null);
    form.resetFields();
  };

  const preventNonIntegerKey = (
    event: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (
      event.ctrlKey ||
      event.metaKey ||
      allowedIntegerKeys.has(event.key) ||
      /^[0-9]$/.test(event.key)
    ) {
      return;
    }
    event.preventDefault();
  };

  const preventInvalidIntegerPaste = (
    event: React.ClipboardEvent<HTMLInputElement>,
  ) => {
    if (!/^\d*$/.test(event.clipboardData.getData("text"))) {
      event.preventDefault();
    }
  };

  const openCreateModal = () => {
    setEditingStandard(null);
    form.resetFields();
    setCreateModalOpen(true);
  };

  const openEditModal = (standard: IShiftStandard) => {
    setEditingStandard(standard);
    form.setFieldsValue({
      category: standard.category,
      standard: standard.standard,
      notification_text: standard.notification_text,
    });
    setCreateModalOpen(true);
  };

  const createShiftStandard = async () => {
    try {
      const values = await form.validateFields();
      if (editingStandard) {
        await updateShiftStandardMutation.mutateAsync({
          shiftStandardId: editingStandard.shift_standard_id,
          payload: values,
        });
      } else {
        await createShiftStandardMutation.mutateAsync(values);
      }
      notificationApi?.success({
        message: "Успешно",
        description: editingStandard
          ? "Стандарт смены обновлён"
          : "Стандарт смены создан",
        placement: "bottomRight",
        duration: 2,
      });
      closeCreateModal();
    } catch (error) {
      const description = getApiErrorMessage(
        error,
        "Не удалось сохранить стандарт смены",
      );
      notificationApi?.error({
        message: "Ошибка",
        description,
        placement: "bottomRight",
        duration: 2,
      });
    }
  };

  const deleteStandard = async (shiftStandardId: string) => {
    try {
      await deleteShiftStandardMutation.mutateAsync(shiftStandardId);
      notificationApi?.success({
        message: "Удалено",
        description: "Стандарт смены удалён",
        placement: "bottomRight",
        duration: 2,
      });
    } catch (error) {
      const description = getApiErrorMessage(
        error,
        "Не удалось удалить стандарт смены",
      );
      notificationApi?.error({
        message: "Ошибка",
        description,
        placement: "bottomRight",
        duration: 2,
      });
    }
  };

  const filteredShiftStandards = React.useMemo(() => {
    const notificationSearchValue = notificationSearch.trim().toLowerCase();
    return shiftStandards.filter((standard) => {
      const matchesNotification = notificationSearchValue
        ? standard.notification_text
            .toLowerCase()
            .includes(notificationSearchValue)
        : true;
      const matchesStandard =
        typeof standardSearch === "number"
          ? standard.standard === standardSearch
          : true;
      const matchesCategory =
        typeof category === "number" ? standard.category === category : true;
      return matchesNotification && matchesStandard && matchesCategory;
    });
  }, [category, notificationSearch, shiftStandards, standardSearch]);

  const columns = [
    {
      title: "Категория",
      dataIndex: "category",
      key: "category",
      render: (value: number) =>
        categoryMap.find((category) => category.value === value)?.label ??
        value,
    },
    {
      title: "Норматив, ч.",
      dataIndex: "standard",
      key: "standard",
      render: (value: number) => `${value} ч.`,
    },
    {
      title: "Текст уведомления",
      dataIndex: "notification_text",
      key: "notification_text",
      render: (value: string) => (
        <Typography.Paragraph ellipsis={{ rows: 3 }}>
          {value || "—"}
        </Typography.Paragraph>
      ),
    },
    // {
    //   title: "Создан",
    //   dataIndex: "created_at",
    //   key: "created_at",
    //   width: "170px",
    //   render: (value: number) => dateTimestampToLocalDateTimeString(value),
    // },
    {
      title: "Действия",
      key: "actions",
      width: "116px",
      render: (_: unknown, record: IShiftStandard) => (
        <Space>
          <Button
            type="link"
            icon={<EditTwoTone twoToneColor="#e40808" />}
            onClick={() => openEditModal(record)}
            aria-label="Редактировать стандарт смены"
          />
          <Popconfirm
            title="Удалить стандарт смены?"
            okText="Удалить"
            cancelText="Отмена"
            onConfirm={() => deleteStandard(record.shift_standard_id)}
          >
            <Button
              type="link"
              icon={<DeleteTwoTone twoToneColor="#e40808" />}
              aria-label="Удалить стандарт смены"
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
          { title: "Стандарты смен" },
        ]}
      />
      <Content className="shift-standards">
        <div className="shift-standards__toolbar">
          <Space wrap className="shift-standards__filters">
            <Input
              allowClear
              value={notificationSearch}
              placeholder="Поиск по уведомлению"
              onChange={(event) => setNotificationSearch(event.target.value)}
            />
            <InputNumber
              min={1}
              max={24}
              precision={0}
              value={standardSearch}
              placeholder="Норматив, ч."
              onChange={(value) =>
                setStandardSearch(typeof value === "number" ? value : undefined)
              }
              onKeyDown={preventNonIntegerKey}
              onPaste={preventInvalidIntegerPaste}
            />
            <Select
              allowClear
              value={category}
              placeholder="Категория"
              options={categoryMap}
              onChange={(value) => setCategory(value)}
            />
          </Space>
          <Button
            type="primary"
            icon={<PlusCircleTwoTone twoToneColor="#ffffff" />}
            onClick={openCreateModal}
          >
            Создать стандарт
          </Button>
        </div>
        {isPending && <Spin />}
        {isError && (
          <Alert
            type="error"
            message="Не удалось загрузить стандарты смен"
            showIcon
          />
        )}
        {!isError && !isPending && (
          <Table<IShiftStandard>
            rowKey="shift_standard_id"
            dataSource={filteredShiftStandards}
            columns={columns}
            loading={isFetching}
            pagination={false}
            locale={{ emptyText: "Стандарты смен не найдены" }}
          />
        )}
      </Content>
      <Modal
        title={
          editingStandard
            ? "Редактирование стандарта смены"
            : "Создание стандарта смены"
        }
        open={isCreateModalOpen}
        onOk={createShiftStandard}
        onCancel={closeCreateModal}
        confirmLoading={
          createShiftStandardMutation.isPending ||
          updateShiftStandardMutation.isPending
        }
        okText={editingStandard ? "Сохранить" : "Создать"}
        cancelText="Отмена"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Категория"
            name="category"
            rules={[{ required: true, message: "Выберите категорию" }]}
          >
            <Select options={categoryMap} placeholder="Выберите категорию" />
          </Form.Item>
          <Form.Item
            label="Норматив, ч."
            name="standard"
            rules={[
              {
                validator: (_, value) =>
                  typeof value === "number" &&
                  Number.isInteger(value) &&
                  value >= 1 &&
                  value <= 24
                    ? Promise.resolve()
                    : Promise.reject(
                        new Error("Укажите целое число часов от 1 до 24"),
                      ),
              },
            ]}
          >
            <InputNumber
              min={1}
              max={24}
              precision={0}
              onKeyDown={preventNonIntegerKey}
              onPaste={preventInvalidIntegerPaste}
              style={{ width: "100%" }}
            />
          </Form.Item>
          <Form.Item label="Текст уведомления" name="notification_text">
            <Input.TextArea autoSize={{ minRows: 3, maxRows: 8 }} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};
