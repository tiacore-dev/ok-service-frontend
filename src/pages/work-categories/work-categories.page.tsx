import { useSelector } from "react-redux";
import {
  Breadcrumb,
  Button,
  Layout,
  Modal,
  Popconfirm,
  Space,
  Table,
  Form,
  Input,
} from "antd";
import * as React from "react";
import { isMobile } from "../../utils/isMobile";
import { Link } from "react-router-dom";
import { IWorkCategoriesListColumn } from "../../interfaces/workCategories/IWorkCategoriesList";
import {
  DeleteTwoTone,
  EditTwoTone,
} from "@ant-design/icons";
import { getCurrentRole } from "../../store/modules/auth";
import { RoleId } from "../../interfaces/roles/IRole";
import {
  useCreateWorkCategoryMutation,
  useDeleteWorkCategoryMutation,
  useUpdateWorkCategoryMutation,
  useWorkCategoriesQuery,
} from "../../queries/workCategories";
import { NotificationContext } from "../../contexts/NotificationContext";
import "./work-categories.page.less";

export const WorkCategories = () => {
  const { Content } = Layout;
  const [form] = Form.useForm<{ name: string }>();
  const [modalOpen, setModalOpen] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [editingRecord, setEditingRecord] =
    React.useState<IWorkCategoriesListColumn | null>(null);
  const currentRole = useSelector(getCurrentRole);

  const notificationApi = React.useContext(NotificationContext);
  const {
    data: workCategories = [],
    isPending,
    isFetching,
  } = useWorkCategoriesQuery();
  const createWorkCategoryMutation = useCreateWorkCategoryMutation();
  const updateWorkCategoryMutation = useUpdateWorkCategoryMutation();
  const deleteWorkCategoryMutation = useDeleteWorkCategoryMutation();

  const workCategoriesData: IWorkCategoriesListColumn[] = React.useMemo(
    () =>
      workCategories.map((doc) => ({ ...doc, key: doc.work_category_id })),
    [workCategories],
  );

  const openCreateModal = () => {
    setEditingRecord(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEditModal = (record: IWorkCategoriesListColumn) => {
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
      const row = await form.validateFields();
      setSaving(true);
      if (editingRecord) {
        await updateWorkCategoryMutation.mutateAsync({
          categoryId: editingRecord.work_category_id,
          payload: row,
        });
        notificationApi?.success({
          message: "Успешно",
          description: "Категория работ изменена",
          placement: "bottomRight",
          duration: 2,
        });
      } else {
        await createWorkCategoryMutation.mutateAsync(row);
        notificationApi?.success({
          message: "Успешно",
          description: "Категория работ создана",
          placement: "bottomRight",
          duration: 2,
        });
      }
      closeModal();
    } catch (errInfo) {
      const description =
        errInfo instanceof Error
          ? errInfo.message
          : "Не удалось сохранить категорию работы";
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
  const isLoading = isPending || isFetching;

  const handleDelete = async (key: string) => {
    try {
      await deleteWorkCategoryMutation.mutateAsync(key);
      notificationApi?.success({
        message: "Удалено",
        description: "Категория работ удалена",
        placement: "bottomRight",
        duration: 2,
      });
    } catch (error) {
      const description =
        error instanceof Error
          ? error.message
          : "Не удалось удалить категорию";
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
      title: "Наименование",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Действия",
      dataIndex: "operation",
      width: !isMobile() && "116px",
      hidden: currentRole !== RoleId.ADMIN,
      render: (_: string, record: IWorkCategoriesListColumn) => {
        return (
          <Space>
            <Button
              icon={<EditTwoTone twoToneColor="#e40808" />}
              type="link"
              onClick={() => openEditModal(record)}
            />
            <Popconfirm
              title="Удалить?"
              onConfirm={() => handleDelete(record.key)}
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

  return (
    <>
      <Breadcrumb
        className="breadcrumb"
        items={[
          { title: <Link to="/home">Главная</Link> },
          { title: <Link to="/works">Работы</Link> },
          { title: "Категории работ" },
        ]}
      />
      <Content
        className="work-categories__content"
      >
        {currentRole === RoleId.ADMIN && (
          <Space
            direction={isMobile() ? "vertical" : "horizontal"}
            className="work-categories__actions"
          >
            <Button
              onClick={openCreateModal}
              type="primary"
              className="work-categories__add-button"
            >
              Добавить категорию работ
            </Button>
          </Space>
        )}

        <Table
          bordered={!isMobile()}
          pagination={false}
          dataSource={workCategoriesData}
          columns={columns}
          loading={isLoading}
        />
      </Content>
      <Modal
        title={
          editingRecord
            ? "Редактирование категории работ"
            : "Создание категории работ"
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
            label="Наименование"
            name="name"
            rules={[{ required: true, message: "Введите наименование" }]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};
