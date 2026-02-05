import React from "react";
import { ActionDialog } from "./ActionDialog";
import { DeleteTwoTone } from "@ant-design/icons";

interface IDeleteMaterialDialogProps {
  material_id?: string;
  name?: string;
  iconOnly?: boolean;
  buttonType?: "link" | "primary" | "text" | "default" | "dashed";
  onDelete: () => void;
}

export const DeleteMaterialDialog = (props: IDeleteMaterialDialogProps) => {
  const { onDelete, name, iconOnly = true, buttonType = "default" } = props;

  return (
    <ActionDialog
      onConfirm={onDelete}
      buttonText={iconOnly ? "" : "Удалить"}
      popoverText={iconOnly && "Удалить"}
      buttonType={buttonType}
      buttonIcon={<DeleteTwoTone twoToneColor="#ff1616" />}
      modalTitle={`Подтверждение удаления материала ${name}`}
      modalText={<p>Вы действительно хотитие удалить материал {name}?</p>}
    />
  );
};
