import React from "react";
import { Alert, Form, Modal, Select, InputNumber, Space, Spin } from "antd";
import { IShiftReportDetail } from "../../interfaces/shiftReportDetails/IShiftReportDetail";
import "./EditableShiftReportDetailDialog.less";

interface EditableShiftReportDetailDialogProps {
  visible: boolean;
  onCancel: () => void;
  onSave: (values: any) => void;
  initialValues?: Partial<IShiftReportDetail>;
  projectWorksOptions: Array<{
    label: string;
    value: string;
    disabled?: boolean;
    title?: string;
  }>;
  loading?: boolean;
  optionsLoading?: boolean;
  optionsError?: string;
  saveError?: string;
  onValuesChange?: () => void;
  validateSelection?: (values: {
    project_work: string;
    quantity: number;
  }) => string | undefined;
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
  optionsLoading = false,
  optionsError,
  saveError,
  onValuesChange,
  validateSelection,
}) => {
  const [form] = Form.useForm();
  const selectedWork = Form.useWatch("project_work", form);
  const quantity = Form.useWatch("quantity", form);
  const selectionError = selectedWork
    ? validateSelection?.({
        project_work: selectedWork,
        quantity: Number(quantity),
      })
    : undefined;

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
      okButtonProps={{
        disabled:
          optionsLoading || Boolean(optionsError) || Boolean(selectionError),
      }}
      cancelButtonProps={{ disabled: loading }}
      closable={!loading}
      maskClosable={!loading}
      keyboard={!loading}
      okText="Сохранить"
      cancelText="Отмена"
    >
      {optionsError && <Alert type="error" showIcon message={optionsError} />}
      {saveError && <Alert type="error" showIcon message={saveError} />}
      <Form
        form={form}
        layout="vertical"
        onFinish={onSave}
        onValuesChange={onValuesChange}
        disabled={loading}
      >
        <Form.Item
          name="project_work"
          label="Наименование"
          validateStatus={selectionError ? "error" : undefined}
          help={selectionError}
          rules={[
            { required: true, message: "Пожалуйста, выберите наименование" },
          ]}
        >
          <Select
            options={projectWorksOptions}
            showSearch
            optionFilterProp="label"
            placeholder="Выберите наименование"
            loading={optionsLoading}
            aria-busy={optionsLoading}
            notFoundContent={
              optionsLoading ? (
                <Space>
                  <Spin size="small" />
                  Загрузка работ…
                </Space>
              ) : (
                (optionsError ?? "Работы не найдены")
              )
            }
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
