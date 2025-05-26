"use client";

import * as React from "react";
import {
  Breadcrumb,
  Button,
  Card,
  Checkbox,
  Layout,
  Popconfirm,
  Space,
  Spin,
  Table,
} from "antd";
import Title from "antd/es/typography/Title";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import type { IState } from "../../store/modules";
import { minPageHeight } from "../../utils/pageSettings";
import { isMobile } from "../../utils/isMobile";
import { useProjects } from "../../hooks/ApiActions/projects";
import { EditableProjectDialog } from "../../components/ActionDialogs/EditableProjectDialog/EditableProjectDialog";
import { DeleteProjectDialog } from "../../components/ActionDialogs/DeleteProjectDialog";
import { Link } from "react-router-dom";
import { getObjectsMap } from "../../store/modules/pages/selectors/objects.selector";
import { getUsersMap } from "../../store/modules/pages/selectors/users.selector";
import type { IProjectWorksListColumn } from "../../interfaces/projectWorks/IProjectWorksList";
import { getProjectWorksByProjectId } from "../../store/modules/pages/selectors/project-works.selector";
import { useProjectWorks } from "../../hooks/ApiActions/project-works";
import { useObjects } from "../../hooks/ApiActions/objects";
import { useUsers } from "../../hooks/ApiActions/users";
import { clearProjectState } from "../../store/modules/pages/project.state";
import { useWorks } from "../../hooks/ApiActions/works";
import { DeleteTwoTone, EditTwoTone } from "@ant-design/icons";
import { getCurrentRole, getCurrentUserId } from "../../store/modules/auth";
import { RoleId } from "../../interfaces/roles/IRole";
import { ImportProjectWorks } from "./ImportProjectWorks";
import { selectProjectStat } from "../../store/modules/pages/selectors/project.selector";
import { EditableProjectWorkDialog } from "./EditableProjectWorkDialog";

export const Project = () => {
  const { Content } = Layout;
  const [modalVisible, setModalVisible] = React.useState(false);
  const [editingRecord, setEditingRecord] =
    React.useState<IProjectWorksListColumn | null>(null);
  const currentRole = useSelector(getCurrentRole);

  const dispatch = useDispatch();
  const { getProjectWorks, deleteProjectWork, editProjectWork } =
    useProjectWorks();
  const { getObjects } = useObjects();
  const { getUsers } = useUsers();
  const [importMode, setImportMode] = React.useState(false);
  const objectsMap = useSelector(getObjectsMap);
  const usersMap = useSelector(getUsersMap);
  const routeParams = useParams();
  const { getProject, deleteProject, getProjectStat } = useProjects();
  const { getWorks } = useWorks();

  React.useEffect(() => {
    getUsers();
    getObjects();
    getWorks();
    getProjectStat(routeParams.projectId);
    getProject(routeParams.projectId);
    getProjectWorks(routeParams.projectId);

    return () => {
      dispatch(clearProjectState());
    };
  }, []);

  const currentUserId = useSelector(getCurrentUserId);
  const projectData = useSelector((state: IState) => state.pages.project.data);
  const isLoaded = useSelector((state: IState) => state.pages.project.loaded);
  const stat = useSelector(selectProjectStat);
  const worksData = useSelector((state: IState) => state.pages.works.data);

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
    [projectWorks, stat]
  );

  const canEdit =
    (currentRole === RoleId.PROJECT_LEADER &&
      projectData?.project_leader &&
      currentUserId === projectData.project_leader) ||
    currentRole === RoleId.MANAGER ||
    currentRole === RoleId.ADMIN;

  const handleSignedChange = (
    record: IProjectWorksListColumn,
    checked: boolean
  ) => {
    const updatedData = {
      ...record,
      signed: checked,
      project: projectData?.project_id || "",
      quantity: Number(record.quantity),
    };

    editProjectWork(record.project_work_id, updatedData);
  };

  const handleAdd = () => {
    setEditingRecord(null);
    setModalVisible(true);
  };

  const handleEdit = (record: IProjectWorksListColumn) => {
    setEditingRecord(record);
    setModalVisible(true);
  };

  const handleDelete = (key: string) => {
    deleteProjectWork(key, routeParams.projectId);
  };

  const handleModalCancel = () => {
    setModalVisible(false);
    setEditingRecord(null);
  };

  const handleModalSave = () => {
    setModalVisible(false);
    setEditingRecord(null);
  };

  const columns = [
    {
      title: "Наименование",
      dataIndex: "project_work_name",
      key: "project_work_name",
    },
    {
      title: "Работа",
      dataIndex: "work",
      key: "work",
      render: (value: string) => {
        const work = worksData.find((w) => w.work_id === value);
        return work?.name || value;
      },
    },
    {
      title: "Количество",
      dataIndex: "quantity",
      key: "quantity",
      width: "100px",
    },
    {
      title: "Согласовано",
      dataIndex: "signed",
      key: "signed",
      width: "80px",
      render: (value: boolean, record: IProjectWorksListColumn) => (
        <Checkbox
          checked={value}
          onChange={(e) => handleSignedChange(record, e.target.checked)}
          disabled={
            !canEdit || (currentRole === RoleId.PROJECT_LEADER && value)
          }
        />
      ),
    },
    ...(canEdit
      ? [
          {
            title: "Действия",
            dataIndex: "operation",
            width: !isMobile() && "116px",
            render: (_: string, record: IProjectWorksListColumn) => (
              <Space>
                <Button
                  disabled={
                    currentRole === RoleId.PROJECT_LEADER && record.signed
                  }
                  icon={<EditTwoTone twoToneColor="#e40808" />}
                  type="link"
                  onClick={() => handleEdit(record)}
                />
                <Popconfirm
                  title="Удалить?"
                  onConfirm={() => handleDelete(record.key)}
                >
                  <Button
                    disabled={
                      currentRole === RoleId.PROJECT_LEADER && record.signed
                    }
                    icon={<DeleteTwoTone twoToneColor="#e40808" />}
                    type="link"
                  />
                </Popconfirm>
              </Space>
            ),
          },
        ]
      : []),
  ];

  const isLoading = useSelector(
    (state: IState) => state.pages.workPrices.loading
  );

  const object = objectsMap[projectData?.object];
  const objectLink = `/objects/${projectData?.object}`;

  return (
    <>
      <Breadcrumb
        className="breadcrumb"
        style={isMobile() && { backgroundColor: "#F8F8F8" }}
        items={[
          { title: <Link to="/home">Главная</Link> },
          { title: <Link to="/objects">Объекты</Link> },
          { title: <Link to={objectLink}>{object?.name}</Link> },
          { title: projectData?.name || "Проект" },
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
            {canEdit && <EditableProjectDialog project={projectData} />}
            {canEdit && (
              <DeleteProjectDialog
                onDelete={() => deleteProject(projectData.project_id)}
                name={projectData.name}
              />
            )}
          </Space>
          <Card style={{ margin: "8px 0" }}>
            <p>Наименование: {projectData.name}</p>
            <p>Объект: {objectsMap[projectData.object]?.name}</p>
            <p>Прораб: {usersMap[projectData.project_leader]?.name}</p>
          </Card>

          {importMode ? (
            <ImportProjectWorks
              project={projectData}
              close={() => {
                setImportMode(false);
              }}
            />
          ) : (
            <>
              {canEdit && (
                <Space
                  direction={isMobile() ? "vertical" : "horizontal"}
                  className="works_filters"
                  style={{ marginBottom: 16 }}
                >
                  <Button onClick={handleAdd} type="primary">
                    Добавить запись в спецификацию
                  </Button>
                  <Button
                    loading={!projectWorksIsLoaded}
                    onClick={() => {
                      setImportMode(true);
                    }}
                    type="default"
                  >
                    Загрузить
                  </Button>
                </Space>
              )}

              <Table
                bordered={!isMobile()}
                pagination={false}
                dataSource={projectWorksData}
                columns={columns}
                loading={isLoading}
              />
            </>
          )}

          <EditableProjectWorkDialog
            visible={modalVisible}
            onCancel={handleModalCancel}
            onSave={handleModalSave}
            initialValues={editingRecord}
            projectId={projectData?.project_id}
            isEditing={!!editingRecord}
          />
        </Content>
      ) : (
        <Spin />
      )}
    </>
  );
};
