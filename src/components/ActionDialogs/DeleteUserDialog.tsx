import React from "react";
import { ActionDialog } from "./ActionDialog";
import { DeleteTwoTone } from "@ant-design/icons";

interface IDeleteUserDialogProps {
  user_id?: string;
  name?: string;
  iconOnly?: boolean;
  buttonType?: "link" | "primary" | "text" | "default" | "dashed";
  onDelete: () => void;
}

export const DeleteUserDialog = (props: IDeleteUserDialogProps) => {
  const { onDelete, name, iconOnly = true, buttonType = "default" } = props;

  return (
    <ActionDialog
      onConfirm={onDelete}
      buttonText={iconOnly ? "" : "Удалить"}
      popoverText={iconOnly ? "Удалить" : undefined}
      buttonType={buttonType}
      buttonIcon={<DeleteTwoTone twoToneColor="#ff1616" />}
      modalTitle={`Подтверждение удаления карточки пользователя ${name}`}
      modalText={
        <p>Вы действительно хотитие удалить карточку пользователя {name}?</p>
      }
    />
  );
};
