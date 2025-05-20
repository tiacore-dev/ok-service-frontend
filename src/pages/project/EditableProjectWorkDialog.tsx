import React, { useCallback, useEffect } from "react";
import { Form, Input, InputNumber, Select, Modal } from "antd";
import { IProjectWorksList } from "../../interfaces/projectWorks/IProjectWorksList";
import { useProjectWorks } from "../../hooks/ApiActions/project-works";
import { useWorks } from "../../hooks/ApiActions/works";
import { useSelector } from "react-redux";
import { IState } from "../../store/modules";
import { isMobile } from "../../utils/isMobile";
import "./EditableProjectWorkDialog.less"; // Добавьте этот импорт

interface IEditableProjectWorkDialogProps {
  visible: boolean;
  onCancel: () => void;
  onSave: () => void;
  initialValues?: IProjectWorksList;
  projectId: string;
  isEditing: boolean;
}

export const EditableProjectWorkDialog: React.FC<
  IEditableProjectWorkDialogProps
> = ({ visible, onCancel, onSave, initialValues, projectId, isEditing }) => {
  const [form] = Form.useForm();
  const { createProjectWork, editProjectWork } = useProjectWorks();
  const { getWorks } = useWorks();
  const worksData = useSelector((state: IState) => state.pages.works.data);

  useEffect(() => {
    getWorks();
  }, []);

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue(initialValues);
    } else {
      form.resetFields();
    }
  }, [initialValues, form]);

  const worksOptions = worksData.map((el) => ({
    label: (
      <span className="work-option-label" style={{ whiteSpace: "normal" }}>
        {el.name}
      </span>
    ),
    value: el.work_id,
    disabled: el.deleted,
  }));

  const handleSubmit = useCallback(() => {
    form
      .validateFields()
      .then((values) => {
        const data = {
          ...values,
          project: projectId,
          quantity: Number(values.quantity),
        };

        if (isEditing && initialValues) {
          editProjectWork(initialValues.project_work_id, data);
        } else {
          createProjectWork(data);
        }

        onSave();
        form.resetFields();
      })
      .catch((info) => {
        console.log("Validate Failed:", info);
      });
  }, [form, projectId, isEditing, initialValues, onSave]);

  return (
    <Modal
      className="project-work-modal" // Добавлен класс для модального окна
      title={isEditing ? "Редактировать запись" : "Добавить запись"}
      visible={visible}
      onOk={handleSubmit}
      onCancel={onCancel}
      okText="Сохранить"
      cancelText="Отмена"
      width={isMobile() ? "90%" : "50%"} // Адаптивная ширина модального окна
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="project_work_name"
          label="Наименование"
          rules={[
            { required: true, message: "Пожалуйста, введите наименование" },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="work"
          label="Работа"
          rules={[{ required: true, message: "Пожалуйста, выберите работу" }]}
        >
          <Select
            className="work-select" // Добавлен класс для Select
            options={worksOptions}
            showSearch
            optionFilterProp="label"
            dropdownMatchSelectWidth={false}
            dropdownStyle={{ minWidth: 250 }} // Минимальная ширина выпадающего списка
            dropdownClassName="work-dropdown" // Добавлен класс для выпадающего списка
          />
        </Form.Item>

        <Form.Item
          name="quantity"
          label="Количество"
          rules={[
            { required: true, message: "Пожалуйста, введите количество" },
          ]}
        >
          <InputNumber min={0} style={{ width: "100%" }} />
        </Form.Item>
      </Form>
    </Modal>
  );
};
