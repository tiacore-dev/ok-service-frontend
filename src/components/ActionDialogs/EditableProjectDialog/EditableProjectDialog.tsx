import React, { useCallback } from "react";
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
import { useProjects } from "../../../hooks/ApiActions/projects";
import { getModalContentWidth } from "../../../utils/pageSettings";
import { RoleId } from "../../../interfaces/roles/IRole";

const modalContentWidth = getModalContentWidth();
interface IEditableProjectDialogProps {
  project?: IProject;
  iconOnly?: boolean;
}

export const EditableProjectDialog = (props: IEditableProjectDialogProps) => {
  const { project, iconOnly } = props;
  const { createProject, editProject } = useProjects();
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
    (state: IState) => state.editableEntities.editableProject
  );
  const objectMap = useSelector(
    (state: IState) => state.pages.objects.data
  ).map((el) => ({
    label: el.name,
    value: el.object_id,
  }));

  const userMap = useSelector((state: IState) => state.pages.users.data)
    .filter((user) => user.role === RoleId.PROJECT_LEADER)
    .map((el) => ({
      label: el.name,
      value: el.user_id,
    }));

  const { sent, ...projectData } = data;

  const handleConfirm = useCallback(() => {
    if (project) {
      editProject(project.project_id, projectData);
    } else {
      createProject(projectData);
    }
  }, [project, projectData, projectData]);

  const handeOpen = useCallback(() => {
    if (project) {
      dispatch(editProjectAction.setProjectData(project));
    } else {
      dispatch(clearCreateProjectState());
    }
  }, [project, dispatch]);

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
          <Form layout="horizontal" style={{ width: modalContentWidth }}>
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
