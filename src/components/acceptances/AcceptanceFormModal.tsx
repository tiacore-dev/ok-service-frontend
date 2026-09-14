import * as React from "react";
import dayjs from "dayjs";
import { DatePicker, Form, Input, Modal, Select } from "antd";
import { NotificationContext } from "../../contexts/NotificationContext";
import type { IAcceptance } from "../../interfaces/acceptances/IAcceptance";
import {
  useCreateAcceptanceMutation,
  useUpdateAcceptanceMutation,
} from "../../queries/acceptances";
import { dateFormat } from "../../utils/dateConverter";

export const acceptanceStatusOptions = [
  { value: "presented", label: "Предъявлено" },
  { value: "violations_found", label: "Выявлены нарушения" },
  { value: "accepted_on_site", label: "Принято на объекте" },
  { value: "documents_signed", label: "Документы подписаны" },
] as const;

type AcceptanceFormValues = {
  date: dayjs.Dayjs;
  status: IAcceptance["status"];
  comment?: string;
};

type Props = {
  open: boolean;
  projectId: string;
  acceptance?: IAcceptance | null;
  onClose: () => void;
};

export const AcceptanceFormModal = ({
  open,
  projectId,
  acceptance,
  onClose,
}: Props) => {
  const [form] = Form.useForm<AcceptanceFormValues>();
  const notificationApi = React.useContext(NotificationContext);
  const createMutation = useCreateAcceptanceMutation();
  const updateMutation = useUpdateAcceptanceMutation();
  const isEditing = Boolean(acceptance);

  React.useEffect(() => {
    if (!open) return;

    form.setFieldsValue({
      date: acceptance ? dayjs(acceptance.date) : dayjs(),
      status: acceptance?.status ?? "presented",
      comment: acceptance?.comment,
    });
  }, [acceptance, form, open]);

  const submit = async () => {
    const values = await form.validateFields();
    const payload = {
      project_id: projectId,
      date: values.date.startOf("day").valueOf(),
      status: values.status,
      comment: values.comment,
    };

    try {
      if (acceptance) {
        await updateMutation.mutateAsync({ id: acceptance.id, payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
      form.resetFields();
      onClose();
    } catch (error) {
      notificationApi?.error({
        message: "Ошибка",
        description:
          error instanceof Error
            ? error.message
            : isEditing
              ? "Не удалось сохранить приёмку"
              : "Не удалось создать приёмку",
        placement: "bottomRight",
      });
    }
  };

  return (
    <Modal
      open={open}
      title={isEditing ? "Редактировать приёмку" : "Создать приёмку"}
      onCancel={() => {
        form.resetFields();
        onClose();
      }}
      onOk={submit}
      okText={isEditing ? "Сохранить" : "Создать"}
      cancelText="Отмена"
      confirmLoading={createMutation.isPending || updateMutation.isPending}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="date"
          label="Дата"
          rules={[{ required: true, message: "Укажите дату" }]}
        >
          <DatePicker format={dateFormat} style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item
          name="status"
          label="Статус"
          rules={[{ required: true, message: "Выберите статус" }]}
        >
          <Select options={[...acceptanceStatusOptions]} />
        </Form.Item>
        <Form.Item name="comment" label="Комментарий">
          <Input.TextArea autoSize={{ minRows: 2, maxRows: 4 }} />
        </Form.Item>
      </Form>
    </Modal>
  );
};
