import * as React from "react";
import { useSelector } from "react-redux";
import {
  Alert,
  Breadcrumb,
  Button,
  Form,
  Input,
  Layout,
  Modal,
  Space,
  Table,
  Typography,
} from "antd";
import { EditTwoTone, EyeOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import { getCurrentRole } from "../../store/modules/auth";
import { RoleId } from "../../interfaces/roles/IRole";
import { dateTimestampToLocalDateTimeString } from "../../utils/dateConverter";
import type { ISystemSetting } from "../../interfaces/systemSettings/ISystemSetting";
import {
  useSystemSettingQuery,
  useSystemSettingsQuery,
  useUpdateSystemSettingMutation,
} from "../../queries/systemSettings";
import { NotificationContext } from "../../contexts/NotificationContext";
import { getApiErrorMessage } from "../../utils/getApiErrorMessage";
import "./system-settings.page.less";

interface SystemSettingFormValues {
  value: string;
}

export const SystemSettings = () => {
  const { Content } = Layout;
  const currentRole = useSelector(getCurrentRole);
  const isAdmin = currentRole === RoleId.ADMIN;
  const notificationApi = React.useContext(NotificationContext);
  const [form] = Form.useForm<SystemSettingFormValues>();
  const [selectedSetting, setSelectedSetting] =
    React.useState<ISystemSetting | null>(null);
  const [isViewModalOpen, setViewModalOpen] = React.useState(false);
  const [isEditModalOpen, setEditModalOpen] = React.useState(false);

  const {
    data: systemSettings = [],
    isPending,
    isFetching,
    isError,
  } = useSystemSettingsQuery({ enabled: isAdmin });
  const { data: selectedSettingDetails, isPending: isSettingPending } =
    useSystemSettingQuery(selectedSetting?.system_setting_id ?? "", {
      enabled: isAdmin && Boolean(selectedSetting),
    });
  const updateSystemSettingMutation = useUpdateSystemSettingMutation();

  const settingValue = selectedSettingDetails?.value ?? selectedSetting?.value;

  React.useEffect(() => {
    if (isEditModalOpen && typeof settingValue === "string") {
      form.setFieldValue("value", settingValue);
    }
  }, [form, isEditModalOpen, settingValue]);

  const closeViewModal = () => {
    setViewModalOpen(false);
    setSelectedSetting(null);
  };

  const closeEditModal = () => {
    setEditModalOpen(false);
    setSelectedSetting(null);
    form.resetFields();
  };

  const openViewModal = (setting: ISystemSetting) => {
    setSelectedSetting(setting);
    setViewModalOpen(true);
  };

  const openEditModal = (setting: ISystemSetting) => {
    setSelectedSetting(setting);
    form.setFieldValue("value", setting.value);
    setEditModalOpen(true);
  };

  const save = async () => {
    if (!selectedSetting) {
      return;
    }

    try {
      const values = await form.validateFields();
      await updateSystemSettingMutation.mutateAsync({
        systemSettingId: selectedSetting.system_setting_id,
        payload: { value: values.value },
      });
      notificationApi?.success({
        message: "Успешно",
        description: "Системная настройка обновлена",
        placement: "bottomRight",
        duration: 2,
      });
      closeEditModal();
    } catch (error) {
      const description = getApiErrorMessage(
        error,
        "Не удалось сохранить системную настройку",
      );
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
      title: "Настройка",
      dataIndex: "system_setting_id",
      key: "system_setting_id",
      width: "28%",
    },
    {
      title: "Текст",
      dataIndex: "value",
      key: "value",
      render: (value: string) => (
        <div className="system-settings__prompt-preview">{value}</div>
      ),
    },
    {
      title: "Изменено",
      dataIndex: "modified_at",
      key: "modified_at",
      width: "170px",
      render: (value?: number) =>
        value ? dateTimestampToLocalDateTimeString(value) : "—",
    },
    {
      title: "Действия",
      key: "actions",
      width: "120px",
      render: (_: unknown, record: ISystemSetting) => (
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => openViewModal(record)}
            aria-label="Просмотреть системную настройку"
          />
          <Button
            type="link"
            icon={<EditTwoTone twoToneColor="#e40808" />}
            onClick={() => openEditModal(record)}
            aria-label="Редактировать системную настройку"
          />
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
          { title: "Системные настройки" },
        ]}
      />
      <Content className="system-settings">
        {!isAdmin ? (
          <Typography.Text>
            Раздел доступен только администратору.
          </Typography.Text>
        ) : isError ? (
          <Alert
            type="error"
            message="Не удалось загрузить системные настройки"
            showIcon
          />
        ) : (
          <Table
            rowKey="system_setting_id"
            dataSource={systemSettings}
            columns={columns}
            loading={isPending || isFetching}
            pagination={{ pageSize: 20 }}
            locale={{ emptyText: "Системные настройки не найдены" }}
          />
        )}
      </Content>

      <Modal
        title={selectedSetting?.system_setting_id ?? "Системная настройка"}
        open={isViewModalOpen}
        onCancel={closeViewModal}
        footer={null}
        width={800}
      >
        {isSettingPending ? (
          <Typography.Text>Загрузка…</Typography.Text>
        ) : (
          <Typography.Paragraph className="system-settings__value">
            {settingValue || "—"}
          </Typography.Paragraph>
        )}
      </Modal>

      <Modal
        title={selectedSetting?.system_setting_id ?? "Редактирование настройки"}
        open={isEditModalOpen}
        onOk={save}
        onCancel={closeEditModal}
        confirmLoading={updateSystemSettingMutation.isPending}
        okText="Сохранить"
        cancelText="Отмена"
        width={800}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Текст системного промпта"
            name="value"
            rules={[
              { required: true, whitespace: true, message: "Введите текст" },
            ]}
          >
            <Input.TextArea autoSize={{ minRows: 12, maxRows: 28 }} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};
