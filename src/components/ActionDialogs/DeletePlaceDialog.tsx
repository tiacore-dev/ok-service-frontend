import { DeleteTwoTone } from "@ant-design/icons";
import { Button, Modal } from "antd";
import React from "react";

interface DeletePlaceDialogProps {
  name: string;
  onDelete: () => Promise<void>;
}

export const DeletePlaceDialog = ({
  name,
  onDelete,
}: DeletePlaceDialogProps) => {
  const [open, setOpen] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await onDelete();
      setOpen(false);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <Button
        type="text"
        icon={<DeleteTwoTone twoToneColor="#ff1616" />}
        onClick={() => setOpen(true)}
      />
      <Modal
        title={`Подтвердите удаление места ${name}`}
        open={open}
        okText="Удалить"
        cancelText="Отмена"
        okButtonProps={{ danger: true }}
        confirmLoading={deleting}
        onOk={handleDelete}
        onCancel={() => setOpen(false)}
      >
        <p>Вы уверены, что хотите удалить место {name}?</p>
      </Modal>
    </>
  );
};
