import React, { useCallback, useContext } from "react";
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
import "./EditableObjectDialog.less";
import { getModalContentWidth } from "../../../utils/pageSettings";
import { RoleId } from "../../../interfaces/roles/IRole";
import { useUsersMap } from "../../../queries/users";
import { useNavigate } from "react-router-dom";
import {
  useCreateObjectMutation,
  useUpdateObjectMutation,
  type EditableObjectPayload,
} from "../../../queries/objects";
import { NotificationContext } from "../../../contexts/NotificationContext";
import { useObjectStatuses } from "../../../queries/objectStatuses";
import { useCitiesMap } from "../../../queries/cities";

const modalContentWidth = getModalContentWidth();

interface IEditableObjectDialogProps {
  object?: IObject;
  iconOnly?: boolean;
}

export const EditableObjectDialog = (props: IEditableObjectDialogProps) => {
  const { object, iconOnly } = props;
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
    (state: IState) => state.editableEntities.editableObject,
  );
  const { statusOptions } = useObjectStatuses();

  const { sent, object_id, ...objectData } = data;
  const navigate = useNavigate();
  const notificationApi = useContext(NotificationContext);
  const createObjectMutation = useCreateObjectMutation();
  const updateObjectMutation = useUpdateObjectMutation();

  const handleConfirm = useCallback(async () => {
    dispatch(editObjectAction.sendObject());

    try {
      if (object?.object_id ?? object_id) {
        const targetId = object?.object_id ?? object_id;
        await updateObjectMutation.mutateAsync({
          objectId: targetId!,
          payload: objectData as EditableObjectPayload,
        });
        notificationApi?.success({
          message: "Успешно",
          description: "Объект изменен",
          placement: "bottomRight",
          duration: 2,
        });
      } else {
        await createObjectMutation.mutateAsync(
          objectData as EditableObjectPayload,
        );
        notificationApi?.success({
          message: "Успешно",
          description: "Объект создан",
          placement: "bottomRight",
          duration: 2,
        });
      }
      navigate("/objects");
    } catch (error) {
      dispatch(editObjectAction.saveError());
      const description =
        error instanceof Error
          ? error.message
          : "Возникла ошибка при сохранении объекта";
      notificationApi?.error({
        message: "Ошибка",
        description,
        placement: "bottomRight",
        duration: 2,
      });
    }
  }, [
    dispatch,
    object,
    objectData,
    updateObjectMutation,
    notificationApi,
    createObjectMutation,
    navigate,
  ]);

  const handeOpen = useCallback(() => {
    if (object) {
      dispatch(editObjectAction.setObjectData(object));
    } else {
      dispatch(clearCreateObjectState());
    }
  }, [object, dispatch]);

  const { users } = useUsersMap();
  const userOptions = users
    .filter(
      (user) => user.role === RoleId.MANAGER || user.role === RoleId.ADMIN,
    )
    .map((el) => ({
      label: el.name,
      value: el.user_id,
    }));

  const { cityOptions } = useCitiesMap();

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
              label="Город"
            >
              <Select
                value={data.city}
                onChange={(value: string) =>
                  dispatch(editObjectAction.setCity(value))
                }
                options={cityOptions}
                allowClear
                placeholder="Выберите город"
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
                options={userOptions}
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
                options={statusOptions}
                disabled={sent}
              />
            </Form.Item>
          </Form>
        </Space>
      }
    />
  );
};
