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
  TreeSelect,
} from "antd";
import * as React from "react";
import { isMobile } from "../../utils/isMobile";
import { Link } from "react-router-dom";
import { IWorkCategoriesListColumn } from "../../interfaces/workCategories/IWorkCategoriesList";
import { DeleteTwoTone, EditTwoTone } from "@ant-design/icons";
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
import {
  buildWorkCategoryTree,
  getDescendantCategoryIds,
  workCategoryOptions,
} from "../../utils/workCategoryTree";
import { getApiErrorMessage } from "../../utils/getApiErrorMessage";

export const WorkCategories = () => {
  const { Content } = Layout;
  const [form] = Form.useForm<{ name: string; parent_id?: string | null }>();
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
    () => buildWorkCategoryTree(workCategories),
    [workCategories],
  );
  const parentOptions = React.useMemo(
    () =>
      workCategoryOptions(
        workCategories,
        editingRecord
          ? getDescendantCategoryIds(
              workCategories,
              editingRecord.work_category_id,
            )
          : undefined,
      ),
    [workCategories, editingRecord],
  );

  const openCreateModal = () => {
    setEditingRecord(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEditModal = (record: IWorkCategoriesListColumn) => {
    setEditingRecord(record);
    form.setFieldsValue({
      name: record.name,
      parent_id: record.parent_id ?? undefined,
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
      const row = await form.validateFields();
      const payload = { ...row, parent_id: row.parent_id ?? null };
      setSaving(true);
      if (editingRecord) {
        await updateWorkCategoryMutation.mutateAsync({
          categoryId: editingRecord.work_category_id,
          payload,
        });
        notificationApi?.success({
          message: "Успешно",
          description: "Категория работ изменена",
          placement: "bottomRight",
          duration: 2,
        });
      } else {
        await createWorkCategoryMutation.mutateAsync(payload);
        notificationApi?.success({
          message: "Успешно",
          description: "Категория работ создана",
          placement: "bottomRight",
          duration: 2,
        });
      }
      closeModal();
    } catch (errInfo) {
      if (errInfo && typeof errInfo === "object" && "errorFields" in errInfo)
        return;
      const description = getApiErrorMessage(
        errInfo,
        "Не удалось сохранить категорию работы",
      );
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
      const description = getApiErrorMessage(
        error,
        "Не удалось удалить категорию",
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
      title: "Наименование",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Действия",
      dataIndex: "operation",
      width: isMobile() ? undefined : "116px",
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
      <Content className="work-categories__content">
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
          expandable={{ defaultExpandAllRows: false }}
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
          <Form.Item label="Родительская категория" name="parent_id">
            <TreeSelect
              allowClear
              showSearch
              treeNodeFilterProp="title"
              placeholder="Верхний уровень"
              treeData={parentOptions}
              style={{ width: "100%" }}
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};
