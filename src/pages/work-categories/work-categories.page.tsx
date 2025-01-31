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
import { useSelector } from "react-redux";
import { IState } from "../../store/modules";
import { isMobile } from "../../utils/isMobile";
import { minPageHeight } from "../../utils/pageSettings";
import { Link } from "react-router-dom";
import { IWorkCategoriesListColumn } from "../../interfaces/workCategories/IWorkCategoriesList";
import { useWorkCategories } from "../../hooks/ApiActions/work-categories";
import { EditableCell } from "./components/editableCell";

export const WorkCategories = () => {
  const { Content } = Layout;
  const [form] = Form.useForm();
  const workCategoriesData: IWorkCategoriesListColumn[] = useSelector(
    (state: IState) => state.pages.workCategories.data
  ).map((doc) => ({ ...doc, key: doc.work_category_id }));

  const [editingKey, setEditingKey] = React.useState("");
  const [newRecordKey, setNewRecordKey] = React.useState("");

  const [dataSource, setDataSource] = React.useState<
    IWorkCategoriesListColumn[]
  >([]);

  const {
    getWorkCategories,
    createWorkCategory,
    editWorkCategory,
    deleteWorkCategory,
  } = useWorkCategories();

  React.useEffect(() => {
    getWorkCategories();
  }, []);

  React.useEffect(() => {
    if (workCategoriesData.length > 0 && dataSource.length === 0) {
      setDataSource(workCategoriesData);
    }
  }, [workCategoriesData]);

  const isEditing = (record: IWorkCategoriesListColumn) =>
    record.key === editingKey;
  const isCreating = (record: IWorkCategoriesListColumn) =>
    record.key === newRecordKey;

  const edit = (record: IWorkCategoriesListColumn) => {
    form.setFieldsValue({ ...record });
    setEditingKey(record.key);
  };

  const cancel = () => {
    setEditingKey("");
    setNewRecordKey("");
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
          console.log(row);
          await createWorkCategory(row);
          setNewRecordKey("");
        } else {
          // Редактирование существующей записи
          await editWorkCategory(item.work_category_id, row);
          setEditingKey("");
        }
        getWorkCategories();
      }
    } catch (errInfo) {
      console.log("Validate Failed:", errInfo);
    }
  };

  const isLoading = useSelector((state: IState) => state.pages.works.loading);

  const handleAdd = () => {
    const newData = {
      key: "new",
      name: "",
    };
    setDataSource([newData, ...dataSource]);
    setNewRecordKey("new");
    form.setFieldsValue({ ...newData });
  };

  const handleDelete = (key: string) => {
    const newData = dataSource.filter((item) => item.key !== key);
    setDataSource(newData);
    deleteWorkCategory(key);
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
      render: (_: string, record: IWorkCategoriesListColumn) => {
        const editable = isEditing(record) || isCreating(record);
        return editable ? (
          <span>
            <Button
              onClick={() => save(record.key)}
              style={{ marginRight: 8 }}
              type="primary"
            >
              Сохранить
            </Button>
            <Popconfirm title="Отменить?" onConfirm={cancel}>
              <Button>Отменить</Button>
            </Popconfirm>
          </span>
        ) : (
          <Space>
            <Button type="link" onClick={() => edit(record)}>
              Редактировать
            </Button>
            <Popconfirm
              title="Удалить?"
              onConfirm={() => handleDelete(record.key)}
            >
              <Button type="link">Удалить</Button>
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
          { title: <Link to="/">Главная</Link> },
          { title: <Link to="/works">Работы</Link> },
          { title: "Категории работ" },
        ]}
      />
      <Content
        style={{
          padding: isMobile() ? 0 : 8,
          margin: 0,
          minHeight: minPageHeight(),
          background: "#FFF",
        }}
      >
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

        <Table
          components={{
            body: {
              cell: EditableCell,
            },
          }}
          dataSource={dataSource}
          columns={mergedColumns}
          loading={isLoading}
        />
      </Content>
    </>
  );
};
