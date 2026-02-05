import React, { useCallback } from "react";
import { ActionDialog } from "../ActionDialog";
import { EditTwoTone, PlusCircleTwoTone } from "@ant-design/icons";
import { Checkbox, Form, Input, Space } from "antd";
import { IMaterial } from "../../../interfaces/materials/IMaterial";
import {
  clearCreateMaterialState,
  editMaterialAction,
} from "../../../store/modules/editableEntities/editableMaterial";
import { useDispatch, useSelector } from "react-redux";
import { IState } from "../../../store/modules";
import "./EditableMaterialDialog.less";
import {
  useCreateMaterialMutation,
  useUpdateMaterialMutation,
} from "../../../queries/materials";
import type { EditableMaterialPayload } from "../../../queries/materials";
import { getModalContentWidth } from "../../../utils/pageSettings";
import { NotificationContext } from "../../../contexts/NotificationContext";
import { useNavigate } from "react-router-dom";

const modalContentWidth = getModalContentWidth();
interface IEditableMaterialDialogProps {
  material?: IMaterial;
  iconOnly?: boolean;
}

export const EditableMaterialDialog = (
  props: IEditableMaterialDialogProps,
) => {
  const { material, iconOnly } = props;
  const createMaterialMutation = useCreateMaterialMutation();
  const updateMaterialMutation = useUpdateMaterialMutation();
  const buttonText = material ? "Редактировать" : "Создать";
  const popoverText = material ? "Редактировать материал" : "Создать материал";
  const buttonIcon = material ? (
    <EditTwoTone twoToneColor="#ff1616" />
  ) : (
    <PlusCircleTwoTone twoToneColor="#ff1616" />
  );

  const modalTitle = material
    ? "Редактирование материала"
    : "Создание нового материала";

  const dispatch = useDispatch();
  const data = useSelector(
    (state: IState) => state.editableEntities.editableMaterial,
  );
  const { sent, ...createMaterialData } = data;
  const notificationApi = React.useContext(NotificationContext);
  const navigate = useNavigate();

  const editMaterialData: EditableMaterialPayload = {
    ...createMaterialData,
  };

  const handleConfirm = useCallback(async () => {
    try {
      if (material) {
        await updateMaterialMutation.mutateAsync({
          materialId: material.material_id,
          payload: editMaterialData,
        });
        notificationApi?.success({
          message: "Успешно",
          description: "Материал изменен",
          placement: "bottomRight",
          duration: 2,
        });
      } else {
        await createMaterialMutation.mutateAsync(createMaterialData);
        notificationApi?.success({
          message: "Успешно",
          description: "Материал создан",
          placement: "bottomRight",
          duration: 2,
        });
      }
      navigate("/materials");
    } catch (error) {
      const description =
        error instanceof Error
          ? error.message
          : "Возникла ошибка при сохранении материала";
      notificationApi?.error({
        message: "Ошибка",
        description,
        placement: "bottomRight",
        duration: 2,
      });
    }
  }, [
    material,
    editMaterialData,
    createMaterialData,
    updateMaterialMutation,
    createMaterialMutation,
    notificationApi,
    navigate,
  ]);

  const handeOpen = useCallback(() => {
    if (material) {
      dispatch(
        editMaterialAction.setMaterialData({
          name: material.name,
          measurement_unit: material.measurement_unit,
          deleted: material.deleted,
          sent: false,
        }),
      );
    } else {
      dispatch(clearCreateMaterialState());
    }
  }, [material, dispatch]);

  const handleNameChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      dispatch(editMaterialAction.setName(event.target.value));
    },
    [],
  );

  const handleMeasurementUnitChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      dispatch(editMaterialAction.setMeasurementUnit(event.target.value));
    },
    [],
  );

  const handleDeleteToggle = useCallback(() => {
    dispatch(editMaterialAction.toggleDelete());
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
        <Space className="editable_material_dialog">
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
