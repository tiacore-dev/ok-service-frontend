import React, { useCallback, useContext } from "react";
import { ActionDialog } from "../ActionDialog";
import { EditTwoTone, PlusCircleTwoTone } from "@ant-design/icons";
import { Form, Input, Select, Space } from "antd";
import { IProject } from "../../../interfaces/projects/IProject";
import {
  clearCreateProjectState,
  editProjectAction,
} from "../../../store/modules/editableEntities/editableProject";
import { useDispatch, useSelector } from "react-redux";
import { IState } from "../../../store/modules";
import "./EditableProjectDialog.less";
import { RoleId } from "../../../interfaces/roles/IRole";
import { useUsersMap } from "../../../queries/users";
import { useObjectsMap } from "../../../queries/objects";
import { useNavigate } from "react-router-dom";
import { NotificationContext } from "../../../contexts/NotificationContext";
import {
  useCreateProjectMutation,
  useUpdateProjectMutation,
  type EditableProjectPayload,
} from "../../../queries/projects";

interface IEditableProjectDialogProps {
  project?: IProject;
  iconOnly?: boolean;
  objectId?: string;
}

export const EditableProjectDialog = (props: IEditableProjectDialogProps) => {
  const { project, iconOnly, objectId } = props;
  const buttonText = project ? "Редактировать" : "Создать";
  const popoverText = project
    ? "Редактировать спецификацию"
    : "Создать спецификацию";
  const buttonIcon = project ? (
    <EditTwoTone twoToneColor="#ff1616" />
  ) : (
    <PlusCircleTwoTone twoToneColor="#ff1616" />
  );
  const modalTitle = project
    ? "Редактирование спецификации"
    : "Создание спецификации";

  const dispatch = useDispatch();
  const data = useSelector(
    (state: IState) => state.editableEntities.editableProject,
  );
  const { objects } = useObjectsMap();
  const objectMap = objects.map((el) => ({
    label: el.name,
    value: el.object_id,
  }));

  const { users } = useUsersMap();
  const userMap = users
    .filter((user) => user.role === RoleId.PROJECT_LEADER)
    .map((el) => ({
      label: el.name,
      value: el.user_id,
    }));

  const { sent, project_id: projectIdFromState, ...projectData } = data;
  const navigate = useNavigate();
  const notificationApi = useContext(NotificationContext);
  const createProjectMutation = useCreateProjectMutation();
  const updateProjectMutation = useUpdateProjectMutation();

  const handleConfirm = useCallback(async () => {
    dispatch(editProjectAction.sendProject());

    try {
      if (project?.project_id ?? projectIdFromState) {
        const targetId = project?.project_id ?? projectIdFromState;
        await updateProjectMutation.mutateAsync({
          projectId: targetId!,
          payload: projectData as EditableProjectPayload,
        });
        notificationApi?.success({
          message: "Успешно",
          description: "Спецификация изменена",
          placement: "bottomRight",
          duration: 2,
        });
      } else {
        const response = await createProjectMutation.mutateAsync(
          projectData as EditableProjectPayload,
        );
        notificationApi?.success({
          message: "Успешно",
          description: "Спецификация создана",
          placement: "bottomRight",
          duration: 2,
        });
        const createdProjectId =
          response.project?.project_id ?? response.project_id;
        if (createdProjectId) {
          navigate(`/projects/${createdProjectId}`);
        } else {
          navigate("/projects");
        }
      }
    } catch (error) {
      dispatch(editProjectAction.saveError());
      const description =
        error instanceof Error
          ? error.message
          : "Возникла ошибка при сохранении спецификации";
      notificationApi?.error({
        message: "Ошибка",
        description,
        placement: "bottomRight",
        duration: 2,
      });
    }
  }, [
    dispatch,
    project,
    projectIdFromState,
    projectData,
    updateProjectMutation,
    notificationApi,
    createProjectMutation,
    navigate,
  ]);

  const handeOpen = useCallback(() => {
    if (project) {
      dispatch(editProjectAction.setProjectData(project));
    } else {
      dispatch(clearCreateProjectState());
      if (objectId) {
        dispatch(editProjectAction.setObject(objectId));
      }
    }
  }, [project, dispatch, objectId]);

  return (
    <ActionDialog
      modalOkText="Сохранить"
      onConfirm={handleConfirm}
      onOpen={handeOpen}
      buttonText={iconOnly ? "" : buttonText}
      popoverText={iconOnly && popoverText}
      buttonType="primary"
      buttonIcon={buttonIcon}
      modalTitle={modalTitle}
      modalText={
        <Space className="editable_project_dialog">
          <Form layout="horizontal" className="editable-project-dialog__form">
            <Form.Item
              labelCol={{ span: 6 }}
              wrapperCol={{ span: 18 }}
              label="Наименование"
            >
              <Input
                value={data.name}
                onChange={(event) =>
                  dispatch(editProjectAction.setName(event.target.value))
                }
                disabled={sent}
              />
            </Form.Item>

            {!objectId && (
              <Form.Item
                labelCol={{ span: 6 }}
                wrapperCol={{ span: 18 }}
                label="Объект"
              >
                <Select
                  value={data.object}
                  onChange={(value: string) =>
                    dispatch(editProjectAction.setObject(value))
                  }
                  options={objectMap}
                  disabled={sent}
                />
              </Form.Item>
            )}

            <Form.Item
              labelCol={{ span: 6 }}
              wrapperCol={{ span: 18 }}
              label="Прораб"
            >
              <Select
                value={data.project_leader}
                onChange={(value: string) =>
                  dispatch(editProjectAction.setProjectLeader(value))
                }
                options={userMap}
                disabled={sent}
              />
            </Form.Item>
          </Form>
        </Space>
      }
    />
  );
};
