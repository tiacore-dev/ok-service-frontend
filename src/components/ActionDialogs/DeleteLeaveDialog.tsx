import React from "react";
import { ActionDialog } from "./ActionDialog";
import { DeleteTwoTone } from "@ant-design/icons";

interface IDeleteLeaveDialogProps {
  leave_id?: string;
  iconOnly?: boolean;
  buttonType?: "link" | "primary" | "text" | "default" | "dashed";
  onDelete: () => void;
}

export const DeleteLeaveDialog = (props: IDeleteLeaveDialogProps) => {
  const { onDelete, iconOnly = true, buttonType = "default" } = props;

  return (
    <ActionDialog
      onConfirm={onDelete}
      buttonText={iconOnly ? "" : "Удалить"}
      popoverText={iconOnly && "Удалить"}
      buttonType={buttonType}
      buttonIcon={<DeleteTwoTone twoToneColor="#ff1616" />}
      modalTitle={`Подтверждение удаления листа отсутствия`}
      modalText={
        <p>Вы действительно хотитие удалить лист отсутствия сотрудника?</p>
      }
    />
  );
};
