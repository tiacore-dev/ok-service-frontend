import React, { useCallback, useMemo } from "react";
import { ActionDialog } from "../ActionDialog";
import { EditTwoTone, PlusCircleTwoTone } from "@ant-design/icons";
import { Form, Input, Select, Space } from "antd";
import { IWork } from "../../../interfaces/works/IWork";
import {
  clearCreateWorkState,
  editWorkAction,
} from "../../../store/modules/editableEntities/editableWork";
import { useDispatch, useSelector } from "react-redux";
import { IState } from "../../../store/modules";
import "./EditableWorkDialog.less";
import { IEditableWork, useWorks } from "../../../hooks/ApiActions/works";
import { getWorkCategoriesAsArray } from "../../../store/modules/dictionaries/selectors/work-categories.selector";
import { useWorkCategories } from "../../../hooks/ApiActions/work-categories";
import { getModalContentWidth } from "../../../utils/pageSettings";
import { selectFilterHandler } from "../../../utils/selectFilterHandler";

const modalContentWidth = getModalContentWidth();
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

  const { getWorkCategories } = useWorkCategories();

  const modalTitle = work ? "Редактирование работы" : "Создание новой работы";
  const categories = useSelector(getWorkCategoriesAsArray);

  if (!categories.length) {
    getWorkCategories();
  }

  const categoriesMap = useMemo(
    () =>
      categories.map((el) => ({
        label: el.name,
        value: el.work_category_id,
      })),
    [categories]
  );

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
      dispatch(
        editWorkAction.setWorkData({
          ...work,
          category: work.category.work_category_id,
          sent: false,
        })
      );
    } else {
      dispatch(clearCreateWorkState());
    }
  }, [work, dispatch]);

  const handleNameChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      dispatch(editWorkAction.setName(event.target.value));
    },
    []
  );

  const handleCategoryChange = useCallback((value: string) => {
    dispatch(editWorkAction.setCategory(value));
  }, []);

  const handleMeasurementUnitChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      dispatch(editWorkAction.setMeasurementUnit(event.target.value));
    },
    []
  );

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
          <Form layout="horizontal" style={{ width: modalContentWidth }}>
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
          </Form>
        </Space>
      }
    />
  );
};
