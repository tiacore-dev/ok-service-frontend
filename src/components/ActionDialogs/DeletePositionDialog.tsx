import React from "react";
import { DeleteTwoTone } from "@ant-design/icons";
import { ActionDialog } from "./ActionDialog";

interface DeletePositionDialogProps {
  name: string;
  onDelete: () => void;
}

export const DeletePositionDialog = ({
  name,
  onDelete,
}: DeletePositionDialogProps) => (
  <ActionDialog
    onConfirm={onDelete}
    buttonText=""
    popoverText="Удалить должность"
    buttonType="default"
    buttonIcon={<DeleteTwoTone twoToneColor="#ff1616" />}
    modalTitle={`Подтвердите удаление должности ${name}`}
    modalText={<p>Вы уверены, что хотите удалить должность {name}?</p>}
  />
);
