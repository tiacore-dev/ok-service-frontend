import { EditTwoTone, PlusCircleTwoTone } from "@ant-design/icons";
import { Button, Form, Input, Modal } from "antd";
import React from "react";
import { NotificationContext } from "../../contexts/NotificationContext";
import type { IPlace } from "../../interfaces/places/IPlace";
import {
  useCreatePlaceMutation,
  useUpdatePlaceMutation,
} from "../../queries/places";

interface EditablePlaceDialogProps {
  objectId: string;
  place?: IPlace;
  iconOnly?: boolean;
}

export const EditablePlaceDialog = ({
  objectId,
  place,
  iconOnly = false,
}: EditablePlaceDialogProps) => {
  const [open, setOpen] = React.useState(false);
  const [form] = Form.useForm<{ name: string; description?: string }>();
  const notificationApi = React.useContext(NotificationContext);
  const createMutation = useCreatePlaceMutation();
  const updateMutation = useUpdatePlaceMutation();
  const isSaving = createMutation.isPending || updateMutation.isPending;

  const handleOpen = () => {
    form.setFieldsValue({
      name: place?.name ?? "",
      description: place?.description ?? "",
    });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    form.resetFields();
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (place) {
        await updateMutation.mutateAsync({
          placeId: place.place_id,
          payload: values,
        });
      } else {
        await createMutation.mutateAsync({ object_id: objectId, ...values });
      }
      handleClose();
    } catch (error) {
      if (error instanceof Error) {
        notificationApi?.error({
          message: "Ошибка",
          description: error.message,
          placement: "bottomRight",
          duration: 2,
        });
      }
    }
  };

  return (
    <>
      <Button
        type={iconOnly ? "text" : "primary"}
        icon={
          place ? (
            <EditTwoTone twoToneColor="#ff1616" />
          ) : (
            <PlusCircleTwoTone twoToneColor="#ff1616" />
          )
        }
        onClick={handleOpen}
      >
        {!iconOnly && (place ? "Редактировать" : "Добавить место")}
      </Button>
      <Modal
        title={place ? "Редактирование места" : "Добавление места"}
        open={open}
        okText="Сохранить"
        cancelText="Отмена"
        confirmLoading={isSaving}
        onOk={handleSubmit}
        onCancel={handleClose}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Наименование"
            name="name"
            rules={[{ required: true, message: "Введите наименование" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item label="Описание" name="description">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};
