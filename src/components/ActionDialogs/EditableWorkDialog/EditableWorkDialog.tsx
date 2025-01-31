import React, { useCallback } from "react";
import { ActionDialog } from "../ActionDialog";
import { EditTwoTone, PlusCircleTwoTone } from "@ant-design/icons";
import { Form, Input, Space } from "antd";
import { IWork } from "../../../interfaces/works/IWork";
import {
  clearCreateWorkState,
  editWorkAction,
} from "../../../store/modules/editableEntities/editableWork";
import { useDispatch, useSelector } from "react-redux";
import { IState } from "../../../store/modules";
import "./EditableWorkDialog.less";
import { IEditableWork, useWorks } from "../../../hooks/ApiActions/works";

interface IEditableWorkDialogProps {
  work?: IWork;
  iconOnly?: boolean;
}

export const EditableWorkDialog = (props: IEditableWorkDialogProps) => {
  const { work, iconOnly } = props;
  const { createWork, editWork } = useWorks();
  const buttonText = work ? "Редактировать" : "Создать";
  const popoverText = work ? "Редактировать работы" : "Создать работу";
  const buttonIcon = work ? (
    <EditTwoTone twoToneColor="#ff1616" />
  ) : (
    <PlusCircleTwoTone twoToneColor="#ff1616" />
  );
  const modalTitle = work ? "Редактирование работы" : "Создание новой работы";

  const dispatch = useDispatch();
  const data = useSelector(
    (state: IState) => state.editableEntities.editableWork
  );
  const { sent, ...createWorkData } = data;

  const editWorkData: IEditableWork = { ...createWorkData };

  const handleConfirm = useCallback(() => {
    if (work) {
      editWork(work.work_id, editWorkData);
    } else {
      createWork(createWorkData);
    }
  }, [work, editWorkData, createWorkData]);

  const handeOpen = useCallback(() => {
    if (work) {
      dispatch(editWorkAction.setWorkData(work));
    } else {
      dispatch(clearCreateWorkState());
    }
  }, [work, dispatch]);

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
        <Space className="editable_work_dialog">
          <Form layout="horizontal">
            <Form.Item label="Наименование">
              <Input
                value={data.name}
                onChange={(event) =>
                  dispatch(editWorkAction.setName(event.target.value))
                }
              />
            </Form.Item>

            <Form.Item label="Категория">
              <Input
                value={data.category}
                onChange={(event) =>
                  dispatch(editWorkAction.setCategory(event.target.value))
                }
              />
            </Form.Item>

            <Form.Item label="Единица измерения">
              <Input
                value={data.measurement_unit}
                onChange={(event) =>
                  dispatch(
                    editWorkAction.setMeasurementUnit(event.target.value)
                  )
                }
              />
            </Form.Item>
          </Form>
        </Space>
      }
    />
  );
};
