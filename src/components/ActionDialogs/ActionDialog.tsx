import React, { useEffect, useState } from "react";
import { Button, Modal, Popconfirm, Popover } from "antd";
import { getModalWidth } from "../../utils/pageSettings";

interface IActionDialogProps {
  buttonText?: string;
  buttonType?: "link" | "text" | "primary" | "default" | "dashed";
  buttonIcon?: React.JSX.Element;
  buttonClassName?: string;
  modalTitle?: string;
  modalText?: React.JSX.Element;
  modalOkText?: string;
  modalOkLoading?: boolean;
  footerDisable?: boolean;
  withPopConfirm?: boolean;
  popConfirmHeader?: string;
  popConfirmText?: string;
  popoverText?: string;
  customModalWidth?: number;
  onOpen?: () => void;
  onConfirm?: () => void;
  beforeConfirm?: () => { reject?: boolean };
}

const modalWidth = getModalWidth();

export const ActionDialog = (props: IActionDialogProps) => {
  const {
    buttonText,
    buttonType,
    buttonIcon,
    buttonClassName,
    modalTitle,
    modalText,
    modalOkLoading,
    modalOkText,
    footerDisable,
    withPopConfirm,
    popConfirmHeader,
    popConfirmText,
    popoverText,
    customModalWidth,
    beforeConfirm,
    onOpen,
    onConfirm,
  } = props;
  const [open, setOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);

  useEffect(() => {
    if (open && onOpen) {
      onOpen();
    }
  }, [open]);

  const showModal = () => {
    setOpen(true);
  };

  const handleOk = async () => {
    if (beforeConfirm && beforeConfirm()) {
      return;
    }

    setConfirmLoading(true);
    if (onConfirm) {
      await onConfirm();
    }

    setOpen(false);
    setConfirmLoading(false);
  };

  const handleCancel = () => {
    setOpen(false);
  };

  const button = (
    <Button
      type={buttonType}
      onClick={showModal}
      icon={buttonIcon}
      className={buttonClassName}
    >
      {buttonText}
    </Button>
  );

  const footerConfirmButton = withPopConfirm ? (
    <Popconfirm
      title={popConfirmHeader ?? "Вы уверены"}
      description={popConfirmText ?? "Вы подтверждаете действие?"}
      onConfirm={handleOk}
      onCancel={handleCancel}
      okText="Да"
      cancelText="Нет"
    >
      <Button>{modalOkText ?? "Ок"}</Button>
    </Popconfirm>
  ) : (
    <Button
      size="large"
      key="submit"
      type="primary"
      loading={modalOkLoading}
      onClick={handleOk}
    >
      {modalOkText ?? "Ок"}
    </Button>
  );
  const footer = footerDisable
    ? null
    : [
        <Button size="large" key="back" onClick={handleCancel}>
          Отмена
        </Button>,
        footerConfirmButton,
      ];

  const popover = popoverText ? (
    <Popover content={popoverText}> {button}</Popover>
  ) : (
    button
  );
  return (
    <>
      {popover}
      <Modal
        width={customModalWidth ?? modalWidth}
        title={modalTitle}
        open={open}
        onOk={handleOk}
        confirmLoading={confirmLoading}
        onCancel={handleCancel}
        footer={footer}
      >
        {modalText}
      </Modal>
    </>
  );
};
