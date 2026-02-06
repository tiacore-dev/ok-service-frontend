import React from "react";
import { Form, Modal, Select, InputNumber } from "antd";
import { IShiftReportDetail } from "../../interfaces/shiftReportDetails/IShiftReportDetail";
import "./EditableShiftReportDetailDialog.less";

interface EditableShiftReportDetailDialogProps {
  visible: boolean;
  onCancel: () => void;
  onSave: (values: any) => void;
  initialValues?: Partial<IShiftReportDetail>;
  projectWorksOptions: Array<{ label: string; value: string }>;
  loading?: boolean;
}

export const EditableShiftReportDetailDialog: React.FC<
  EditableShiftReportDetailDialogProps
> = ({
  visible,
  onCancel,
  onSave,
  initialValues,
  projectWorksOptions,
  loading = false,
}) => {
  const [form] = Form.useForm();

  React.useEffect(() => {
    if (initialValues) {
      form.setFieldsValue(initialValues);
    } else {
      form.resetFields();
    }
  }, [initialValues, form]);

  return (
    <Modal
      title={initialValues ? "Редактировать запись" : "Добавить запись"}
      open={visible}
      onOk={() => form.submit()}
      onCancel={onCancel}
      confirmLoading={loading}
      okText="Сохранить"
      cancelText="Отмена"
    >
      <Form form={form} layout="vertical" onFinish={onSave}>
        <Form.Item
          name="project_work"
          label="Наименование"
          rules={[
            { required: true, message: "Пожалуйста, выберите наименование" },
          ]}
        >
          <Select
            options={projectWorksOptions}
            showSearch
            optionFilterProp="label"
            placeholder="Выберите наименование"
          />
        </Form.Item>

        <Form.Item
          name="quantity"
          label="Количество"
          rules={[
            {
              required: true,
              message: "Пожалуйста, введите количество",
              type: "number",
              min: 0.001,
              transform: (value) => Number(value),
            },
          ]}
        >
          <InputNumber
            min={0}
            step={1}
            className="shift-report-detail-dialog__input"
            placeholder="Введите количество"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};
