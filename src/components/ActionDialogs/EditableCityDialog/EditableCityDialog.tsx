import React, { useCallback } from "react";
import { ActionDialog } from "../ActionDialog";
import { EditTwoTone, PlusCircleTwoTone } from "@ant-design/icons";
import { Form, Input, Space } from "antd";
import { ICity } from "../../../interfaces/cities/ICity";
import {
  clearEditableCityState,
  editCityAction,
} from "../../../store/modules/editableEntities/editableCity";
import { useDispatch, useSelector } from "react-redux";
import { IState } from "../../../store/modules";
import { useCities } from "../../../hooks/ApiActions/cities";
import "./EditableCityDialog.less";
import { getModalContentWidth } from "../../../utils/pageSettings";

const modalContentWidth = getModalContentWidth();

interface IEditableCityDialogProps {
  city?: ICity;
  iconOnly?: boolean;
}

export const EditableCityDialog = (props: IEditableCityDialogProps) => {
  const { city, iconOnly } = props;
  const { createCity, editCity } = useCities();
  const dispatch = useDispatch();
  const data = useSelector(
    (state: IState) => state.editableEntities.editableCity,
  );

  const buttonText = city ? "Редактировать" : "Добавить";
  const popoverText = city ? "Редактировать город" : "Добавить город";
  const buttonIcon = city ? (
    <EditTwoTone twoToneColor="#ff1616" />
  ) : (
    <PlusCircleTwoTone twoToneColor="#ff1616" />
  );
  const modalTitle = city ? "Редактирование города" : "Создание города";

  const handleConfirm = useCallback(() => {
    if (city) {
      editCity(city.city_id, { name: data.name.trim() });
    } else {
      createCity({ name: data.name.trim() });
    }
  }, [city, data.name]);

  const handleOpen = useCallback(() => {
    if (city) {
      dispatch(editCityAction.setCityData(city));
    } else {
      dispatch(clearEditableCityState());
    }
  }, [city, dispatch]);

  const handleChangeName = useCallback(
    (value: string) => {
      dispatch(editCityAction.setName(value));
    },
    [dispatch],
  );

  return (
    <ActionDialog
      modalOkText="Сохранить"
      onConfirm={handleConfirm}
      onOpen={handleOpen}
      buttonText={iconOnly ? "" : buttonText}
      popoverText={iconOnly ? popoverText : undefined}
      buttonType="primary"
      buttonIcon={buttonIcon}
      modalTitle={modalTitle}
      modalText={
        <Space className="editable_city_dialog">
          <Form layout="horizontal" style={{ width: modalContentWidth }}>
            <Form.Item
              labelCol={{ span: 6 }}
              wrapperCol={{ span: 18 }}
              label="Название"
            >
              <Input
                value={data.name}
                onChange={(event) => handleChangeName(event.target.value)}
              />
            </Form.Item>
          </Form>
        </Space>
      }
    />
  );
};
