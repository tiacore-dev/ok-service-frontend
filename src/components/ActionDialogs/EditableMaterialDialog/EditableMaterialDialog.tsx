import React, { useCallback, useMemo } from "react";
import { ActionDialog } from "../ActionDialog";
import { EditTwoTone, PlusCircleTwoTone } from "@ant-design/icons";
import { Checkbox, Form, Input, Select, Space } from "antd";
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
import { NotificationContext } from "../../../contexts/NotificationContext";
import { useNavigate } from "react-router-dom";
import { useMeasurementUnitsQuery } from "../../../queries/measurementUnits";
import { selectFilterHandler } from "../../../utils/selectFilterHandler";

interface IEditableMaterialDialogProps {
  material?: IMaterial;
  iconOnly?: boolean;
}

export const EditableMaterialDialog = (props: IEditableMaterialDialogProps) => {
  const { material, iconOnly } = props;
  const createMaterialMutation = useCreateMaterialMutation();
  const updateMaterialMutation = useUpdateMaterialMutation();
  const { data: measurementUnits = [], isPending: isMeasurementUnitsPending } =
    useMeasurementUnitsQuery();
  const measurementUnitOptions = useMemo(
    () =>
      measurementUnits.map((unit) => ({
        label: unit.name,
        value: unit.measurement_unit_id,
      })),
    [measurementUnits],
  );
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
  const { sent: _sent, ...createMaterialData } = data;
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
          measurement_unit: material.measurement_unit?.measurement_unit_id ?? "",
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
    (value: string) => {
      dispatch(editMaterialAction.setMeasurementUnit(value));
    },
    [dispatch],
  );

  const handleDeleteToggle = useCallback(() => {
    dispatch(editMaterialAction.toggleDelete());
  }, []);

  return (
    <ActionDialog
      modalOkText="Сохранить"
      modalOkDisabled={!data.measurement_unit}
      onConfirm={handleConfirm}
      onOpen={handeOpen}
      buttonText={iconOnly ? "" : buttonText}
      popoverText={iconOnly ? popoverText : undefined}
      buttonType="primary"
      buttonIcon={buttonIcon}
      modalTitle={modalTitle}
      modalText={
        <Space className="editable_material_dialog">
          <Form layout="horizontal" className="editable-material-dialog__form">
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
              <Select
                showSearch
                filterOption={selectFilterHandler}
                placeholder="Выберите единицу измерения"
                loading={isMeasurementUnitsPending}
                value={data.measurement_unit || undefined}
                onChange={handleMeasurementUnitChange}
                options={measurementUnitOptions}
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
