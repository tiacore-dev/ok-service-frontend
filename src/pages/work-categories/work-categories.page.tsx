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
import { EditableCell } from "../components/editableCell";
import {
  CheckCircleTwoTone,
  CloseCircleTwoTone,
  DeleteTwoTone,
  EditTwoTone,
} from "@ant-design/icons";
import { getCurrentRole } from "../../store/modules/auth";
import { RoleId } from "../../interfaces/roles/IRole";

export const WorkCategories = () => {
  const { Content } = Layout;
  const [form] = Form.useForm();
  const workCategories = useSelector(
    (state: IState) => state.pages.workCategories.data
  );

  const workCategoriesData: IWorkCategoriesListColumn[] = React.useMemo(
    () => workCategories.map((doc) => ({ ...doc, key: doc.work_category_id })),
    [workCategories]
  );

  const [editingKey, setEditingKey] = React.useState("");
  const [newRecordKey, setNewRecordKey] = React.useState("");
  const [actualData, setActualData] = React.useState<boolean>(false);
  const currentRole = useSelector(getCurrentRole);

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
    if (!actualData) {
      setDataSource(workCategoriesData);
      setActualData(true);
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
          createWorkCategory(row);
        } else {
          // Редактирование существующей записи
          setActualData(false);
          setEditingKey("");
          editWorkCategory(item.work_category_id, row);
        }
      }
    } catch (errInfo) {
      console.log("Validate Failed:", errInfo);
    }
  };

  const isLoading = useSelector(
    (state: IState) => state.pages.workCategories.loading
  );

  const handleAdd = () => {
    if (!newRecordKey) {
      const newData = {
        key: "new",
        name: "",
      };
      setDataSource([newData, ...dataSource]);
      setNewRecordKey("new");
      form.setFieldsValue({ ...newData });
    }
  };

  const handleDelete = (key: string) => {
    setActualData(false);
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
            components={{
              body: {
                cell: EditableCell,
              },
            }}
            dataSource={dataSource}
            columns={mergedColumns}
            loading={isLoading || !actualData}
          />
        </Form>
      </Content>
    </>
  );
};
