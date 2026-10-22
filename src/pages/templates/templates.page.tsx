import * as React from "react";
import { useSelector } from "react-redux";
import {
  Alert,
  Breadcrumb,
  Button,
  Empty,
  Form,
  Input,
  Layout,
  Modal,
  Popconfirm,
  Select,
  Space,
  Switch,
  Table,
  Tooltip,
  Typography,
  Upload,
} from "antd";
import {
  DeleteTwoTone,
  DownloadOutlined,
  EditTwoTone,
  PlusCircleTwoTone,
  UnorderedListOutlined,
} from "@ant-design/icons";
import type { UploadFile } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { getCurrentRole } from "../../store/modules/auth";
import { RoleId } from "../../interfaces/roles/IRole";
import type {
  ITemplate,
  ITemplateFormValues,
} from "../../interfaces/templates/ITemplate";
import { downloadTemplate } from "../../api/templates.api";
import {
  useTemplateTypesQuery,
  useTemplatesQuery,
  useCreateTemplateMutation,
  useDeleteTemplateMutation,
  useUpdateTemplateMutation,
} from "../../queries/templates";
import { NotificationContext } from "../../contexts/NotificationContext";
import { getApiErrorMessage } from "../../utils/getApiErrorMessage";
import "./templates.page.less";

const downloadBlob = (blob: Blob, fileName: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

export const Templates = () => {
  const { Content } = Layout;
  const navigate = useNavigate();
  const currentRole = useSelector(getCurrentRole);
  const canView =
    currentRole === RoleId.ADMIN || currentRole === RoleId.MANAGER;
  const notificationApi = React.useContext(NotificationContext);
  const [templateType, setTemplateType] = React.useState<string>();
  const [downloadingId, setDownloadingId] = React.useState<string>();
  const [form] = Form.useForm<ITemplateFormValues>();
  const [editingTemplate, setEditingTemplate] = React.useState<ITemplate>();
  const [formOpen, setFormOpen] = React.useState(false);
  const [file, setFile] = React.useState<File>();
  const [deleteConfirmationId, setDeleteConfirmationId] =
    React.useState<string>();
  const {
    data: templateTypes = [],
    isPending: isTypesPending,
    isError: isTypesError,
  } = useTemplateTypesQuery(canView);
  const {
    data: templates = [],
    isPending: isTemplatesPending,
    isFetching: isTemplatesFetching,
    isError: isTemplatesError,
  } = useTemplatesQuery(templateType);
  const createMutation = useCreateTemplateMutation();
  const updateMutation = useUpdateTemplateMutation();
  const deleteMutation = useDeleteTemplateMutation();

  const closeForm = () => {
    setFormOpen(false);
    setEditingTemplate(undefined);
    setFile(undefined);
    form.resetFields();
  };

  const openCreateForm = () => {
    setEditingTemplate(undefined);
    setFile(undefined);
    form.resetFields();
    form.setFieldValue("template_type", templateType);
    setFormOpen(true);
  };

  const openEditForm = (template: ITemplate) => {
    setEditingTemplate(template);
    setFile(undefined);
    form.setFieldsValue({
      name: template.name,
      template_type: template.template_type,
      description: template.description ?? undefined,
      output_file_name: template.output_file_name ?? undefined,
      is_horizontal: template.is_horizontal,
      is_pdf: template.is_pdf,
      is_default: template.is_default,
    });
    setFormOpen(true);
  };

  const saveTemplate = async () => {
    try {
      const values = await form.validateFields();
      if (editingTemplate) {
        const { template_type: _templateType, ...payload } = values;
        await updateMutation.mutateAsync({
          templateId: editingTemplate.id,
          file,
          values: payload,
        });
      } else {
        if (!file) {
          form.setFields([{ name: "file", errors: ["Выберите файл шаблона"] }]);
          return;
        }
        await createMutation.mutateAsync({ file, values });
      }
      notificationApi?.success({
        message: "Успешно",
        description: editingTemplate ? "Шаблон обновлён" : "Шаблон создан",
        placement: "bottomRight",
        duration: 2,
      });
      closeForm();
    } catch (error) {
      notificationApi?.error({
        message: "Ошибка",
        description: getApiErrorMessage(error, "Не удалось сохранить шаблон"),
        placement: "bottomRight",
        duration: 3,
      });
    }
  };

  const removeTemplate = async (template: ITemplate) => {
    setDeleteConfirmationId(undefined);
    try {
      await deleteMutation.mutateAsync(template.id);
      notificationApi?.success({
        message: "Удалено",
        description: "Шаблон удалён",
        placement: "bottomRight",
        duration: 2,
      });
    } catch (error) {
      notificationApi?.error({
        message: "Ошибка",
        description: getApiErrorMessage(error, "Не удалось удалить шаблон"),
        placement: "bottomRight",
        duration: 3,
      });
    }
  };

  const handleDownload = async (template: ITemplate) => {
    try {
      setDownloadingId(template.id);
      const { data } = await downloadTemplate(template.id);
      downloadBlob(data, template.file_name ?? `${template.name}.template`);
    } catch (error) {
      notificationApi?.error({
        message: "Не удалось скачать шаблон",
        description: getApiErrorMessage(error, "Попробуйте ещё раз."),
        placement: "bottomRight",
        duration: 3,
      });
    } finally {
      setDownloadingId(undefined);
    }
  };

  const columns = [
    { title: "Название", dataIndex: "name", key: "name", width: 220 },
    // {
    //   title: "Тип",
    //   dataIndex: "template_type_label",
    //   key: "template_type_label",
    //   width: 180,
    //   render: (value: string | null | undefined, record: ITemplate) =>
    //     value ?? record.template_type,
    // },
    {
      title: "Файл",
      dataIndex: "file_name",
      key: "file_name",
      width: 240,
      render: (value?: string | null) => value ?? "—",
    },
    {
      title: "Описание",
      dataIndex: "description",
      key: "description",
      render: (value?: string | null) =>
        value ? <span className="templates__description">{value}</span> : "—",
    },
    {
      title: "Имя результата",
      dataIndex: "output_file_name",
      key: "output_file_name",
      width: 190,
      render: (value?: string | null) => value ?? "—",
    },
    {
      title: "Параметры",
      key: "options",
      width: 230,
      render: (_: unknown, record: ITemplate) => (
        <Space direction="vertical" size={2}>
          <Space size={8}>
            <Switch size="small" checked={record.is_default} disabled />
            <Typography.Text>По умолчанию</Typography.Text>
          </Space>
          <Space size={8}>
            <Switch size="small" checked={record.is_horizontal} disabled />
            <Typography.Text>Альбомная</Typography.Text>
          </Space>
          <Space size={8}>
            <Switch size="small" checked={record.is_pdf} disabled />
            <Typography.Text>PDF</Typography.Text>
          </Space>
        </Space>
      ),
    },
    // {
    //   title: "Формат",
    //   dataIndex: "content_type",
    //   key: "content_type",
    //   width: 200,
    //   render: (value?: string | null) => value ?? "—",
    // },
    // {
    //   title: "Хранилище",
    //   dataIndex: "s3_key",
    //   key: "s3_key",
    //   render: (value?: string | null) =>
    //     value ? <span className="templates__storage-key">{value}</span> : "—",
    // },
    {
      title: "Действия",
      key: "actions",
      fixed: "right" as const,
      width: 185,
      render: (_: unknown, record: ITemplate) => (
        <Space>
          <Tooltip title="Параметры этого типа шаблона">
            <Button
              type="link"
              icon={<UnorderedListOutlined />}
              aria-label={`Параметры типа ${record.template_type_label ?? record.template_type}`}
              onClick={() =>
                navigate(
                  `/templates/parameters?template_type=${encodeURIComponent(record.template_type)}`,
                )
              }
            />
          </Tooltip>
          <Tooltip title="Скачать файл шаблона">
            <Button
              type="link"
              icon={<DownloadOutlined />}
              aria-label={`Скачать шаблон ${record.name}`}
              loading={downloadingId === record.id}
              onClick={() => handleDownload(record)}
            />
          </Tooltip>
          <Button
            type="link"
            icon={<EditTwoTone twoToneColor="#e40808" />}
            aria-label={`Редактировать шаблон ${record.name}`}
            onClick={() => openEditForm(record)}
          />
          <Popconfirm
            title="Удалить шаблон?"
            okText="Удалить"
            cancelText="Отмена"
            open={deleteConfirmationId === record.id}
            onOpenChange={(open) =>
              setDeleteConfirmationId(open ? record.id : undefined)
            }
            onConfirm={() => {
              void removeTemplate(record);
            }}
          >
            <Button
              type="link"
              icon={<DeleteTwoTone twoToneColor="#e40808" />}
              aria-label={`Удалить шаблон ${record.name}`}
              loading={deleteMutation.isPending}
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
          { title: "Шаблоны" },
        ]}
      />
      <Content className="templates">
        {!canView ? (
          <Typography.Text>
            Раздел доступен администратору и менеджеру.
          </Typography.Text>
        ) : isTypesError ? (
          <Alert
            type="error"
            message="Не удалось загрузить типы шаблонов"
            showIcon
          />
        ) : (
          <>
            <Space className="templates__filters">
              <Select
                placeholder="Выберите тип"
                loading={isTypesPending}
                options={templateTypes.map((type) => ({
                  label: type.label,
                  value: type.value,
                }))}
                value={templateType}
                onChange={setTemplateType}
                style={{ width: 320 }}
                allowClear
              />
              {templateType && (
                <Button
                  type="primary"
                  icon={<PlusCircleTwoTone twoToneColor="#ffffff" />}
                  onClick={openCreateForm}
                >
                  Добавить шаблон
                </Button>
              )}
            </Space>
            {!templateType ? (
              <Empty
                className="templates__empty"
                description="Выберите тип шаблона"
              />
            ) : isTemplatesError ? (
              <Alert
                type="error"
                message="Не удалось загрузить шаблоны"
                showIcon
              />
            ) : (
              <Table
                rowKey="id"
                dataSource={templates}
                columns={columns}
                loading={isTemplatesPending || isTemplatesFetching}
                scroll={{ x: 1600 }}
                pagination={false}
                locale={{ emptyText: "Шаблоны не найдены" }}
              />
            )}
          </>
        )}
      </Content>
      <Modal
        title={
          editingTemplate ? "Редактирование шаблона" : "Добавление шаблона"
        }
        open={formOpen}
        onCancel={closeForm}
        onOk={saveTemplate}
        okText={editingTemplate ? "Сохранить" : "Создать"}
        cancelText="Отмена"
        confirmLoading={createMutation.isPending || updateMutation.isPending}
      >
        <Form form={form} layout="vertical">
          {!editingTemplate && (
            <Form.Item label="Файл шаблона" name="file" required>
              <Upload
                beforeUpload={(nextFile) => {
                  setFile(nextFile as File);
                  return false;
                }}
                maxCount={1}
                fileList={
                  file
                    ? [
                        {
                          uid: "template",
                          name: file.name,
                          status: "done",
                        } as UploadFile,
                      ]
                    : []
                }
                onRemove={() => {
                  setFile(undefined);
                  return true;
                }}
              >
                <Button>Выберите файл</Button>
              </Upload>
            </Form.Item>
          )}
          <Form.Item
            label="Название"
            name="name"
            rules={[
              { required: true, whitespace: true, message: "Введите название" },
            ]}
          >
            <Input />
          </Form.Item>
          {!editingTemplate && (
            <Form.Item
              label="Тип"
              name="template_type"
              rules={[{ required: true, message: "Выберите тип" }]}
            >
              <Select
                options={templateTypes.map((type) => ({
                  label: type.label,
                  value: type.value,
                }))}
              />
            </Form.Item>
          )}
          <Form.Item label="Описание" name="description">
            <Input.TextArea autoSize={{ minRows: 2, maxRows: 5 }} />
          </Form.Item>
          <Form.Item label="Имя результата" name="output_file_name">
            <Input />
          </Form.Item>
          <Form.Item
            label="Альбомная ориентация"
            name="is_horizontal"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
          <Form.Item
            label="Формировать PDF"
            name="is_pdf"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
          <Form.Item
            label="Шаблон по умолчанию"
            name="is_default"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};
