import { useSelector } from "react-redux";
import {
  Breadcrumb,
  Button,
  Form,
  Layout,
  Popconfirm,
  Space,
  Table,
} from "antd";
import * as React from "react";
import { isMobile } from "../../utils/isMobile";
import { minPageHeight } from "../../utils/pageSettings";
import { Link } from "react-router-dom";
import { IWorkCategoriesListColumn } from "../../interfaces/workCategories/IWorkCategoriesList";
import { EditableCell } from "../components/editableCell";
import {
  CheckCircleTwoTone,
  CloseCircleTwoTone,
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

export const WorkCategories = () => {
  const { Content } = Layout;
  const [form] = Form.useForm();
  const [editingKey, setEditingKey] = React.useState("");
  const [newRecordKey, setNewRecordKey] = React.useState("");
  const [actualData, setActualData] = React.useState<boolean>(false);
  const currentRole = useSelector(getCurrentRole);

  const [dataSource, setDataSource] = React.useState<
    IWorkCategoriesListColumn[]
  >([]);

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

  React.useEffect(() => {
    if (!isPending && !isFetching) {
      setDataSource(workCategoriesData);
      if (!actualData) {
        setActualData(true);
      }
    }
  }, [workCategoriesData, isPending, isFetching]);

  const isEditing = (record: IWorkCategoriesListColumn) =>
    record.key === editingKey;
  const isCreating = (record: IWorkCategoriesListColumn) =>
    record.key === newRecordKey;

  const edit = (record: IWorkCategoriesListColumn) => {
    form.setFieldsValue({ ...record });
    setEditingKey(record.key);
    if (newRecordKey) {
      setDataSource(workCategoriesData);
      setNewRecordKey("");
    }
  };

  const cancel = () => {
    setEditingKey("");
    setNewRecordKey("");
    setDataSource(workCategoriesData);
  };

  const save = async (key: string) => {
    try {
      const row = await form.validateFields();
      const newData = [...dataSource];
      const index = newData.findIndex((item) => key === item.key);

      if (index > -1) {
        const item = newData[index];
        if (isCreating(item)) {
          // Создание новой записи
          setActualData(false);
          setNewRecordKey("");
          await createWorkCategoryMutation.mutateAsync(row);
          notificationApi?.success({
            message: "Успешно",
            description: "Категория работ создана",
            placement: "bottomRight",
            duration: 2,
          });
        } else {
          // Редактирование существующей записи
          setActualData(false);
          setEditingKey("");
          await updateWorkCategoryMutation.mutateAsync({
            categoryId: item.work_category_id,
            payload: row,
          });
          notificationApi?.success({
            message: "Успешно",
            description: "Категория работ изменена",
            placement: "bottomRight",
            duration: 2,
          });
        }
      }
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
    }
  };
  const isLoading = isPending || isFetching;

  const handleAdd = () => {
    if (!newRecordKey) {
      const newData = {
        key: "new",
        name: "",
      };
      setDataSource([newData, ...dataSource]);
      setNewRecordKey("new");
      setEditingKey("");
      form.setFieldsValue({ ...newData });
    }
  };

  const handleDelete = async (key: string) => {
    try {
      setActualData(false);
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
      editable: true,
    },
    {
      title: "Действия",
      dataIndex: "operation",
      width: !isMobile() && "116px",
      hidden: currentRole !== RoleId.ADMIN,
      render: (_: string, record: IWorkCategoriesListColumn) => {
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

  const mergedColumns = columns.map((col) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record: IWorkCategoriesListColumn) => ({
        record,
        inputType: "text",
        dataIndex: col.dataIndex,
        title: col.title,
        "data-label": col.title,
        editing: isEditing(record) || isCreating(record),
      }),
    };
  });

  return (
    <>
      <Breadcrumb
        className="breadcrumb"
        style={isMobile() && { backgroundColor: "#F8F8F8" }}
        items={[
          { title: <Link to="/home">Главная</Link> },
          { title: <Link to="/works">Работы</Link> },
          { title: "Категории работ" },
        ]}
      />
      <Content
        style={{
          padding: isMobile() ? 4 : 8,
          margin: 0,
          minHeight: minPageHeight(),
          background: "#FFF",
        }}
      >
        {currentRole === RoleId.ADMIN && (
          <Space
            direction={isMobile() ? "vertical" : "horizontal"}
            className="works_filters"
          >
            <Button
              onClick={handleAdd}
              type="primary"
              style={{ marginBottom: 16 }}
            >
              Добавить категорию работ
            </Button>
          </Space>
        )}

        <Form form={form} component={false}>
          <Table
            bordered={!isMobile()}
            pagination={false}
            components={{
              body: {
                cell: EditableCell,
              },
            }}
            dataSource={dataSource}
            columns={mergedColumns}
            loading={isLoading}
          />
        </Form>
      </Content>
    </>
  );
};
