import * as React from "react";
import {
  Breadcrumb,
  Button,
  Card,
  Form,
  Layout,
  Popconfirm,
  Space,
  Spin,
  Table,
} from "antd";
import Title from "antd/es/typography/Title";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { IState } from "../../store/modules";
import { minPageHeight } from "../../utils/pageSettings";
import { isMobile } from "../../utils/isMobile";
import { useProjects } from "../../hooks/ApiActions/projects";
import { EditableProjectDialog } from "../../components/ActionDialogs/EditableProjectDialog/EditableProjectDialog";
import { DeleteProjectDialog } from "../../components/ActionDialogs/DeleteProjectDialog";
import { Link } from "react-router-dom";
import { getObjectsMap } from "../../store/modules/pages/selectors/objects.selector";
import { getUsersMap } from "../../store/modules/pages/selectors/users.selector";
import { IProjectWorksListColumn } from "../../interfaces/projectWorks/IProjectWorksList";
import { EditableCell } from "../components/editableCell";
import { getProjectWorksByProjectId } from "../../store/modules/pages/selectors/project-works.selector";
import { useProjectWorks } from "../../hooks/ApiActions/project-works";
import { getWorksData } from "../../store/modules/pages/selectors/works.selector";
import { useObjects } from "../../hooks/ApiActions/objects";
import { useUsers } from "../../hooks/ApiActions/users";
import { clearProjectState } from "../../store/modules/pages/project.state";
import { useWorks } from "../../hooks/ApiActions/works";
import {
  CheckCircleTwoTone,
  CloseCircleTwoTone,
  DeleteTwoTone,
  EditTwoTone,
} from "@ant-design/icons";
import { getCurrentRole } from "../../store/modules/auth";
import { RoleId } from "../../interfaces/roles/IRole";

export const Project = () => {
  const { Content } = Layout;

  const [form] = Form.useForm<IProjectWorksListColumn>();
  const [editingKey, setEditingKey] = React.useState("");
  const [newRecordKey, setNewRecordKey] = React.useState("");
  const [actualData, setActualData] = React.useState<boolean>(false);
  const [dataSource, setDataSource] = React.useState<IProjectWorksListColumn[]>(
    []
  );
  const currentRole = useSelector(getCurrentRole);

  const dispatch = useDispatch();

  const {
    getProjectWorks,
    createProjectWork,
    editProjectWork,
    deleteProjectWork,
  } = useProjectWorks();

  const { getObjects } = useObjects();
  const { getUsers } = useUsers();

  const objectsMap = useSelector(getObjectsMap);
  const usersMap = useSelector(getUsersMap);

  const routeParams = useParams();
  const { getProject, deleteProject } = useProjects();
  const { getWorks } = useWorks();

  React.useEffect(() => {
    getUsers();
    getObjects();
    getWorks();
    getProject(routeParams.projectId);
    getProjectWorks(routeParams.projectId);

    return () => {
      dispatch(clearProjectState());
    };
  }, []);

  const projectData = useSelector((state: IState) => state.pages.project.data);
  const isLoaded = useSelector((state: IState) => state.pages.project.loaded);

  const worksData = useSelector(getWorksData);

  const worksOptions = worksData.map((el) => ({
    label: el.name,
    value: el.work_id,
  }));

  const projectWorksIsLoaded = useSelector(
    (state: IState) => state.pages.projectWorks.loaded
  );

  const projectWorks = useSelector((state: IState) =>
    getProjectWorksByProjectId(state, projectData?.project_id)
  );

  const projectWorksData: IProjectWorksListColumn[] = React.useMemo(
    () =>
      projectWorks.map((doc) => ({
        ...doc,
        key: doc.project_work_id,
      })),
    [projectWorks]
  );

  React.useEffect(() => {
    if (projectWorksIsLoaded) {
      setDataSource(projectWorksData);
      if (!actualData) {
        setActualData(true);
      }
    }
  }, [projectWorksData]);

  const isEditing = (record: IProjectWorksListColumn) =>
    record.key === editingKey;
  const isCreating = (record: IProjectWorksListColumn) =>
    record.key === newRecordKey;

  const edit = (record: IProjectWorksListColumn) => {
    console.log(record);
    form.setFieldsValue({ ...record });
    setEditingKey(record.key);
  };

  const cancel = () => {
    setEditingKey("");
    setNewRecordKey("");
    setDataSource(projectWorksData);
  };

  const save = async (key: string) => {
    try {
      const rowData = await form.validateFields();
      const newData = [...dataSource];
      const index = newData.findIndex((item) => key === item.key);

      if (index > -1) {
        const item = newData[index];
        const row = {
          ...rowData,
          project: projectData.project_id,
          quantity: Number(rowData.quantity),
        };

        if (isCreating(item)) {
          // Создание новой записи
          setActualData(false);
          setNewRecordKey("");
          createProjectWork(row);
        } else {
          // Редактирование существующей записи
          setActualData(false);
          setEditingKey("");
          editProjectWork(item.project_work_id, row);
        }
      }
    } catch (errInfo) {
      console.log("Validate Failed:", errInfo);
    }
  };

  const handleAdd = () => {
    if (!newRecordKey) {
      const newData = {
        key: "new",
        project: projectData.project_id,
        work: "",
        quantity: 0,
        summ: 0,
        signed: false,
      };
      setDataSource([newData, ...dataSource]);
      setNewRecordKey("new");
      form.setFieldsValue({ ...newData });
    }
  };

  const handleDelete = (key: string) => {
    setActualData(false);
    deleteProjectWork(key, routeParams.projectId);
  };

  const columns = [
    {
      title: "Работа",
      dataIndex: "work",
      type: "select",
      options: worksOptions,
      key: "work",
      editable: true,
      required: true,
    },

    {
      title: "Количество",
      inputType: "number",
      dataIndex: "quantity",
      key: "quantity",
      editable: true,
      required: true,
    },

    {
      title: "Согласовано",
      inputType: "checkbox",
      dataIndex: "signed",
      key: "signed",
      editable: currentRole === RoleId.MANAGER || currentRole === RoleId.ADMIN,
      required: false,
    },

    {
      title: "Действия",
      dataIndex: "operation",
      width: "116px",
      hidden: currentRole === RoleId.USER,
      render: (_: string, record: IProjectWorksListColumn) => {
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
      onCell: (record: IProjectWorksListColumn) => ({
        type: col.type,
        options: col.options,
        record,
        inputType: col.inputType,
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record) || isCreating(record),
      }),
    };
  });

  const isLoading = useSelector(
    (state: IState) => state.pages.workPrices.loading
  );

  const table = (
    <Form form={form} component={false}>
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
    </Form>
  );

  return (
    <>
      <Breadcrumb
        className="breadcrumb"
        style={isMobile() && { backgroundColor: "#F8F8F8" }}
        items={[
          { title: <Link to="/home">Главная</Link> },
          {
            title: <Link to="/projects">Спецификации</Link>,
          },
          { title: projectData?.name },
        ]}
      />
      {isLoaded &&
      projectData &&
      routeParams.projectId === projectData.project_id ? (
        <Content
          style={{
            padding: "0 24px",
            margin: 0,
            minHeight: minPageHeight(),
            background: "#FFF",
          }}
        >
          <Title level={3}>{projectData.name}</Title>
          <Space
            direction={isMobile() ? "vertical" : "horizontal"}
            size="small"
          >
            {currentRole !== RoleId.USER && (
              <EditableProjectDialog project={projectData} />
            )}
            {currentRole !== RoleId.USER && (
              <DeleteProjectDialog
                onDelete={() => {
                  deleteProject(projectData.project_id);
                }}
                name={projectData.name}
              />
            )}
          </Space>
          <Card style={{ margin: "8px 0" }}>
            <p>Наименование: {projectData.name}</p>
            <p>Объект: {objectsMap[projectData.object]?.name}</p>
            <p>Прораб: {usersMap[projectData.project_leader]?.name}</p>
          </Card>

          {currentRole !== RoleId.USER && (
            <Space
              direction={isMobile() ? "vertical" : "horizontal"}
              className="works_filters"
            >
              <Button
                onClick={handleAdd}
                type="primary"
                style={{ marginBottom: 16 }}
              >
                Добавить запись в спецификацию
              </Button>
            </Space>
          )}

          {table}
        </Content>
      ) : (
        <Spin />
      )}
    </>
  );
};
