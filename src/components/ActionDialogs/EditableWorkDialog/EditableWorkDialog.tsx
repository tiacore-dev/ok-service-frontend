import React, { useCallback, useMemo } from "react";
import { ActionDialog } from "../ActionDialog";
import { EditTwoTone, PlusCircleTwoTone } from "@ant-design/icons";
import { Checkbox, Form, Input, Select, Space } from "antd";
import { IWork } from "../../../interfaces/works/IWork";
import {
  clearCreateWorkState,
  editWorkAction,
} from "../../../store/modules/editableEntities/editableWork";
import { useDispatch, useSelector } from "react-redux";
import { IState } from "../../../store/modules";
import "./EditableWorkDialog.less";
import {
  useCreateWorkMutation,
  useUpdateWorkMutation,
} from "../../../queries/works";
import type { EditableWorkPayload } from "../../../queries/works";
import { useWorkCategoriesQuery } from "../../../queries/workCategories";
import { selectFilterHandler } from "../../../utils/selectFilterHandler";
import { NotificationContext } from "../../../contexts/NotificationContext";
import { useNavigate } from "react-router-dom";

interface IEditableWorkDialogProps {
  work?: IWork;
  iconOnly?: boolean;
}

export const EditableWorkDialog = (props: IEditableWorkDialogProps) => {
  const { work, iconOnly } = props;
  const createWorkMutation = useCreateWorkMutation();
  const updateWorkMutation = useUpdateWorkMutation();
  const buttonText = work ? "Редактировать" : "Создать";
  const popoverText = work ? "Редактировать работы" : "Создать работу";
  const buttonIcon = work ? (
    <EditTwoTone twoToneColor="#ff1616" />
  ) : (
    <PlusCircleTwoTone twoToneColor="#ff1616" />
  );

  const modalTitle = work ? "Редактирование работы" : "Создание новой работы";
  const { data: categoriesData = [] } = useWorkCategoriesQuery();
  const categoriesMap = useMemo(
    () =>
      categoriesData.map((el) => ({
        label: el.name,
        value: el.work_category_id,
      })),
    [categoriesData],
  );

  const dispatch = useDispatch();
  const data = useSelector(
    (state: IState) => state.editableEntities.editableWork,
  );
  const { sent, ...createWorkData } = data;
  const notificationApi = React.useContext(NotificationContext);
  const navigate = useNavigate();

  const editWorkData: EditableWorkPayload = {
    ...createWorkData,
  };

  const handleConfirm = useCallback(async () => {
    try {
      if (work) {
        await updateWorkMutation.mutateAsync({
          workId: work.work_id,
          payload: editWorkData,
        });
        notificationApi?.success({
          message: "Успешно",
          description: "Работа изменена",
          placement: "bottomRight",
          duration: 2,
        });
      } else {
        await createWorkMutation.mutateAsync(createWorkData);
        notificationApi?.success({
          message: "Успешно",
          description: "Работа создана",
          placement: "bottomRight",
          duration: 2,
        });
      }
      navigate("/works");
    } catch (error) {
      const description =
        error instanceof Error
          ? error.message
          : "Возникла ошибка при сохранении работы";
      notificationApi?.error({
        message: "Ошибка",
        description,
        placement: "bottomRight",
        duration: 2,
      });
    }
  }, [
    work,
    editWorkData,
    createWorkData,
    updateWorkMutation,
    createWorkMutation,
    notificationApi,
    navigate,
  ]);

  const handeOpen = useCallback(() => {
    if (work) {
      dispatch(
        editWorkAction.setWorkData({
          ...work,
          category: work.category.work_category_id,
          sent: false,
        }),
      );
    } else {
      dispatch(clearCreateWorkState());
    }
  }, [work, dispatch]);

  const handleNameChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      dispatch(editWorkAction.setName(event.target.value));
    },
    [],
  );

  const handleCategoryChange = useCallback((value: string) => {
    dispatch(editWorkAction.setCategory(value));
  }, []);

  const handleMeasurementUnitChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      dispatch(editWorkAction.setMeasurementUnit(event.target.value));
    },
    [],
  );

  const handleDeleteToggle = useCallback(() => {
    dispatch(editWorkAction.toggleDelete());
  }, []);

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
          <Form layout="horizontal" className="editable-work-dialog__form">
            <Form.Item
              labelCol={{ span: 6 }}
              wrapperCol={{ span: 18 }}
              label="Наименование"
            >
              <Input value={data.name} onChange={handleNameChange} />
            </Form.Item>

            <Form.Item
              labelCol={{ span: 6 }}
              wrapperCol={{ span: 18 }}
              label="Категория"
            >
              <Select
                showSearch
                filterOption={selectFilterHandler}
                value={data.category}
                onChange={handleCategoryChange}
                options={categoriesMap}
              />
            </Form.Item>

            <Form.Item
              labelCol={{ span: 6 }}
              wrapperCol={{ span: 18 }}
              label="Ед. измерения"
            >
              <Input
                value={data.measurement_unit}
                onChange={handleMeasurementUnitChange}
              />
            </Form.Item>

            <Form.Item
              labelCol={{ span: 6 }}
              wrapperCol={{ span: 18 }}
              label="Удалено"
            >
              <Checkbox checked={data.deleted} onChange={handleDeleteToggle} />
            </Form.Item>
          </Form>
        </Space>
      }
    />
  );
};
