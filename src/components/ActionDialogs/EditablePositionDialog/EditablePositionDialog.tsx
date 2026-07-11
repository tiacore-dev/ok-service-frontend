import React, { useCallback, useEffect, useState } from "react";
import { EditTwoTone, PlusCircleTwoTone } from "@ant-design/icons";
import { Form, Input, Space } from "antd";
import { ActionDialog } from "../ActionDialog";
import type { IPosition } from "../../../interfaces/positions/IPosition";
import {
  useCreatePositionMutation,
  useUpdatePositionMutation,
} from "../../../queries/positions";
import "./EditablePositionDialog.less";

interface EditablePositionDialogProps {
  position?: IPosition;
  iconOnly?: boolean;
}

export const EditablePositionDialog = ({
  position,
  iconOnly,
}: EditablePositionDialogProps) => {
  const [name, setName] = useState("");
  const createPositionMutation = useCreatePositionMutation();
  const updatePositionMutation = useUpdatePositionMutation();
  const isEditing = Boolean(position);

  useEffect(() => {
    setName(position?.name ?? "");
  }, [position]);

  const handleOpen = useCallback(() => {
    setName(position?.name ?? "");
  }, [position]);

  const handleConfirm = useCallback(async () => {
    const payload = { name: name.trim() };
    if (position) {
      await updatePositionMutation.mutateAsync({
        positionId: position.position_id,
        payload,
      });
      return;
    }
    await createPositionMutation.mutateAsync(payload);
  }, [name, position, createPositionMutation, updatePositionMutation]);

  return (
    <ActionDialog
      modalOkText="Сохранить"
      onConfirm={handleConfirm}
      onOpen={handleOpen}
      modalOkDisabled={!name.trim()}
      buttonText={iconOnly ? "" : isEditing ? "Редактировать" : "Добавить"}
      popoverText={
        iconOnly
          ? isEditing
            ? "Редактировать должность"
            : "Добавить должность"
          : undefined
      }
      buttonType="primary"
      buttonIcon={
        isEditing ? (
          <EditTwoTone twoToneColor="#ff1616" />
        ) : (
          <PlusCircleTwoTone twoToneColor="#ff1616" />
        )
      }
      modalTitle={isEditing ? "Редактирование должности" : "Создание должности"}
      modalText={
        <Space className="editable_position_dialog">
          <Form layout="horizontal" className="editable-position-dialog__form">
            <Form.Item
              labelCol={{ span: 6 }}
              wrapperCol={{ span: 18 }}
              label="Название"
            >
              <Input
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </Form.Item>
          </Form>
        </Space>
      }
    />
  );
};
