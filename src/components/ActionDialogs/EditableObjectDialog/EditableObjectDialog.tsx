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
          <Form layout="horizontal">
            <Form.Item label="Наименование">
              <Input
                value={data.name}
                onChange={(event) =>
                  dispatch(editObjectAction.setName(event.target.value))
                }
                disabled={sent}
              />
            </Form.Item>

            <Form.Item label="Адрес">
              <Input
                value={data.address}
                onChange={(event) =>
                  dispatch(editObjectAction.setAddress(event.target.value))
                }
                disabled={sent}
              />
            </Form.Item>

            <Form.Item label="Описание">
              <Input
                value={data.description}
                onChange={(event) =>
                  dispatch(editObjectAction.setDescription(event.target.value))
                }
                disabled={sent}
              />
            </Form.Item>

            <Form.Item label="Статус">
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
