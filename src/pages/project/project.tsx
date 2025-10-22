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
import { Link, useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { minPageHeight } from "../../utils/pageSettings";
import { isMobile } from "../../utils/isMobile";
import { EditableProjectDialog } from "../../components/ActionDialogs/EditableProjectDialog/EditableProjectDialog";
import { DeleteProjectDialog } from "../../components/ActionDialogs/DeleteProjectDialog";
import type { IProjectWorksListColumn } from "../../interfaces/projectWorks/IProjectWorksList";
import { useUsersMap } from "../../queries/users";
import { useObjectsMap } from "../../queries/objects";
import { DeleteTwoTone, EditTwoTone } from "@ant-design/icons";
import { getCurrentRole, getCurrentUserId } from "../../store/modules/auth";
import { RoleId } from "../../interfaces/roles/IRole";
import { ImportProjectWorks } from "./ImportProjectWorks";
import { EditableProjectWorkDialog } from "./EditableProjectWorkDialog";
import { useWorksMap } from "../../queries/works";
import {
  useDeleteProjectMutation,
  useProjectQuery,
} from "../../queries/projects";
import {
  useDeleteProjectWorkMutation,
  useProjectWorksMap,
  useUpdateProjectWorkMutation,
} from "../../queries/projectWorks";
import { NotificationContext } from "../../contexts/NotificationContext";

export const Project = () => {
  const { Content } = Layout;
  const [modalVisible, setModalVisible] = React.useState(false);
  const [editingRecord, setEditingRecord] =
    React.useState<IProjectWorksListColumn | null>(null);
  const currentRole = useSelector(getCurrentRole);
  const { usersMap } = useUsersMap();
  const { objectsMap } = useObjectsMap();
  const [importMode, setImportMode] = React.useState(false);
  const routeParams = useParams();
  const navigate = useNavigate();
  const notificationApi = React.useContext(NotificationContext);
  const projectId = routeParams.projectId;
  const {
    data: projectData,
    isPending: isProjectPending,
    isFetching: isProjectFetching,
  } = useProjectQuery(projectId, { enabled: Boolean(projectId) });
  const {
    projectWorks,
    isPending: isProjectWorksPending,
    isFetching: isProjectWorksFetching,
  } = useProjectWorksMap(projectId, { enabled: Boolean(projectId) });
  const deleteProjectMutation = useDeleteProjectMutation();
  const updateProjectWorkMutation = useUpdateProjectWorkMutation();
  const deleteProjectWorkMutation = useDeleteProjectWorkMutation();


  const currentUserId = useSelector(getCurrentUserId);
  const isProjectLoading = isProjectPending || isProjectFetching;
  const projectWorksLoading = isProjectWorksPending || isProjectWorksFetching;
  const projectWorksList = projectWorks ?? [];
  const { worksMap } = useWorksMap();

  const projectWorksData: IProjectWorksListColumn[] = React.useMemo(
    () =>
      projectWorksList.map((doc) => ({
        ...doc,
        key: doc.project_work_id,
      })),
    [projectWorksList],
  );

  const canEdit =
    Boolean(
      projectData?.project_leader &&
        currentRole === RoleId.PROJECT_LEADER &&
        currentUserId === projectData.project_leader,
    ) ||
    currentRole === RoleId.MANAGER ||
    currentRole === RoleId.ADMIN;

  const handleSignedChange = React.useCallback(
    async (record: IProjectWorksListColumn, checked: boolean) => {
      if (!projectData?.project_id) return;
      try {
        await updateProjectWorkMutation.mutateAsync({
          projectWorkId: record.project_work_id,
          payload: {
            project: projectData.project_id,
            project_work_name: record.project_work_name,
            work: record.work,
            quantity: Number(record.quantity),
            signed: checked,
          },
        });
      } catch (error) {
        const description =
          error instanceof Error
            ? error.message
            : "Не удалось обновить работу спецификации";
        notificationApi?.error({
          message: "Ошибка",
          description,
          placement: "bottomRight",
          duration: 2,
        });
      }
    },
    [projectData, updateProjectWorkMutation, notificationApi],
  );

  const handleAdd = () => {
    setEditingRecord(null);
    setModalVisible(true);
  };

  const handleEdit = (record: IProjectWorksListColumn) => {
    setEditingRecord(record);
    setModalVisible(true);
  };

  const handleDelete = React.useCallback(
    async (projectWorkId: string) => {
      if (!projectData?.project_id) return;
      try {
        await deleteProjectWorkMutation.mutateAsync({
          projectWorkId,
          projectId: projectData.project_id,
        });
        notificationApi?.success({
          message: "Удалено",
          description: "Работа удалена из спецификации",
          placement: "bottomRight",
          duration: 2,
        });
      } catch (error) {
        const description =
          error instanceof Error
            ? error.message
            : "Не удалось удалить работу спецификации";
        notificationApi?.error({
          message: "Ошибка",
          description,
          placement: "bottomRight",
          duration: 2,
        });
      }
    },
    [projectData, deleteProjectWorkMutation, notificationApi],
  );

  const handleDeleteProject = React.useCallback(async () => {
    if (!projectData?.project_id) return;
    try {
      await deleteProjectMutation.mutateAsync(projectData.project_id);
      notificationApi?.success({
        message: "Удалено",
        description: "Спецификация удалена",
        placement: "bottomRight",
        duration: 2,
      });
      navigate("/projects");
    } catch (error) {
      const description =
        error instanceof Error
          ? error.message
          : "Не удалось удалить спецификацию";
      notificationApi?.error({
        message: "Ошибка",
        description,
        placement: "bottomRight",
        duration: 2,
      });
    }
  }, [projectData, deleteProjectMutation, notificationApi, navigate]);

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
        const work = worksMap[value];
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
                  onConfirm={() => handleDelete(record.project_work_id)}
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

  const isLoading = projectWorksLoading;
  const object = projectData ? objectsMap[projectData.object] : undefined;
  const objectLink = projectData ? `/objects/${projectData.object}` : "/objects";
  const isLoaded =
    !isProjectLoading &&
    Boolean(projectData && projectId === projectData.project_id);

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
                onDelete={handleDeleteProject}
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
                    loading={projectWorksLoading}
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
            projectId={projectData?.project_id ?? ""}
            isEditing={!!editingRecord}
          />
        </Content>
      ) : (
        <Spin spinning={isProjectLoading || projectWorksLoading} />
      )}
    </>
  );
};
