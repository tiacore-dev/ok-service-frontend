import React, { useCallback } from "react";
import { ActionDialog } from "../ActionDialog";
import { EditTwoTone, PlusCircleTwoTone } from "@ant-design/icons";
import { Form, Input, Select, Space } from "antd";
import { IObject } from "../../../interfaces/objects/IObject";
import {
  clearCreateObjectState,
  editObjectAction,
} from "../../../store/modules/editableEntities/editableObject";
import { useDispatch, useSelector } from "react-redux";
import { IState } from "../../../store/modules";
import { ObjectStatusId } from "../../../interfaces/objectStatuses/IObjectStatus";
import { getObjectStatuses } from "../../../store/modules/dictionaries/selectors/objectStatuses.selector";
import "./EditableObjectDialog.less";
import { useObjects } from "../../../hooks/ApiActions/objects";
import { getModalContentWidth } from "../../../utils/pageSettings";
import { RoleId } from "../../../interfaces/roles/IRole";

const modalContentWidth = getModalContentWidth();

interface IEditableObjectDialogProps {
  object?: IObject;
  iconOnly?: boolean;
}

export const EditableObjectDialog = (props: IEditableObjectDialogProps) => {
  const { object, iconOnly } = props;
  const { createObject, editObject } = useObjects();
  const buttonText = object ? "Редактировать" : "Создать";
  const popoverText = object ? "Редактировать объект" : "Создать объект";
  const buttonIcon = object ? (
    <EditTwoTone twoToneColor="#ff1616" />
  ) : (
    <PlusCircleTwoTone twoToneColor="#ff1616" />
  );
  const modalTitle = object ? "Редактирование объекта" : "Создание объекта";

  const dispatch = useDispatch();
  const data = useSelector(
    (state: IState) => state.editableEntities.editableObject
  );
  const statusMap = useSelector(getObjectStatuses).map((el) => ({
    label: el.name,
    value: el.object_status_id,
  }));

  const { sent, ...objectData } = data;

  const handleConfirm = useCallback(() => {
    if (object) {
      editObject(object.object_id, objectData);
    } else {
      createObject(objectData);
    }
  }, [object, objectData, objectData]);

  const handeOpen = useCallback(() => {
    if (object) {
      dispatch(editObjectAction.setObjectData(object));
    } else {
      dispatch(clearCreateObjectState());
    }
  }, [object, dispatch]);

  const userMap = useSelector((state: IState) => state.pages.users.data)
    .filter((user) => user.role === RoleId.MANAGER || user.role === RoleId.ADMIN)
    .map((el) => ({
      label: el.name,
      value: el.user_id,
    }));

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
        <Space className="editable_object_dialog">
          <Form layout="horizontal" style={{ width: modalContentWidth }}>
            <Form.Item
              labelCol={{ span: 6 }}
              wrapperCol={{ span: 18 }}
              label="Наименование"
            >
              <Input
                value={data.name}
                onChange={(event) =>
                  dispatch(editObjectAction.setName(event.target.value))
                }
                disabled={sent}
                style={{ width: "100%" }}
              />
            </Form.Item>

            <Form.Item
              labelCol={{ span: 6 }}
              wrapperCol={{ span: 18 }}
              label="Адрес"
            >
              <Input
                value={data.address}
                onChange={(event) =>
                  dispatch(editObjectAction.setAddress(event.target.value))
                }
                disabled={sent}
              />
            </Form.Item>

            <Form.Item
              label="Описание"
              labelCol={{ span: 6 }}
              wrapperCol={{ span: 18 }}
            >
              <Input
                value={data.description}
                onChange={(event) =>
                  dispatch(editObjectAction.setDescription(event.target.value))
                }
                disabled={sent}
              />
            </Form.Item>

            <Form.Item
              label="Менеджер"
              labelCol={{ span: 6 }}
              wrapperCol={{ span: 18 }}
            >
              <Select
                value={data.manager}
                onChange={(value: string) =>
                  dispatch(editObjectAction.setManager(value))
                }
                options={userMap}
                disabled={sent}
              />
            </Form.Item>

            <Form.Item
              label="Статус"
              labelCol={{ span: 6 }}
              wrapperCol={{ span: 18 }}
            >
              <Select
                value={data.status}
                onChange={(value: ObjectStatusId) =>
                  dispatch(editObjectAction.setStatus(value))
                }
                options={statusMap}
                disabled={sent}
              />
            </Form.Item>
          </Form>
        </Space>
      }
    />
  );
};
