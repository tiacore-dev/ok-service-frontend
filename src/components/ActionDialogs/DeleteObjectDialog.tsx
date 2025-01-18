import React from "react";
import { ActionDialog } from "./ActionDialog";
import { DeleteTwoTone } from "@ant-design/icons";

interface IDeleteObjectDialogProps {
  object_id?: string;
  name?: string;
  iconOnly?: boolean;
  buttonType?: "link" | "primary" | "text" | "default" | "dashed";
  onDelete: () => void;
}

export const DeleteObjectDialog = (props: IDeleteObjectDialogProps) => {
  const { onDelete, name, iconOnly = true, buttonType = "default" } = props;

  return (
    <ActionDialog
      onConfirm={onDelete}
      buttonText={iconOnly ? "" : "Удалить"}
      popoverText={iconOnly && "Удалить"}
      buttonType={buttonType}
      buttonIcon={<DeleteTwoTone twoToneColor="#ff1616" />}
      modalTitle={`Подтверждение удаления объекта ${name}`}
      modalText={<p>Вы действительно хотитие удалить объект {name}?</p>}
    />
  );
};
