"use client";

import React, { useCallback, useContext, useEffect, useMemo } from "react";
import { Form, Input, InputNumber, Modal, Checkbox } from "antd";
import type { IProjectWorksList } from "../../interfaces/projectWorks/IProjectWorksList";
import { isMobile } from "../../utils/isMobile";
import "./EditableProjectWorkDialog.less"; // Импорт стилей
import { EnhancedSelect } from "../../components/EnhancedSelect";
import {
  useCreateProjectWorkMutation,
  useUpdateProjectWorkMutation,
  type EditableProjectWorkPayload,
} from "../../queries/projectWorks";
import { NotificationContext } from "../../contexts/NotificationContext";
import { useWorksMap } from "../../queries/works";

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
  const createProjectWorkMutation = useCreateProjectWorkMutation();
  const updateProjectWorkMutation = useUpdateProjectWorkMutation();
  const { works } = useWorksMap();
  const notificationApi = useContext(NotificationContext);

  const customSelectFilterHandler = useCallback(
    (
      input: string,
      option: {
        title: string;
        disabled: boolean;
      },
    ) =>
      !option.disabled &&
      (option?.title ?? "").toLowerCase().includes(input.toLowerCase()),
    [],
  );


  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        ...initialValues,
        // Убедимся, что signed имеет значение, даже если undefined
        signed: initialValues.signed || false,
      });
    } else {
      form.resetFields();
    }
  }, [initialValues, form]);

  // Создаем два варианта отображения для каждой работы
  const worksOptions = useMemo(
    () =>
      works
        .filter((el) => !el.deleted)
        .map((el) => ({
          // Для выпадающего списка - многострочный вариант
          label: (
            <span className="work-option-label" style={{ whiteSpace: "normal" }}>
              {el.name}
            </span>
          ),
          // Для отображения в поле - просто текст
          value: el.work_id,
          disabled: el.deleted,
          // Добавляем текстовое представление для отображения в поле выбора
          title: el.name,
        })),
    [works],
  );

  const handleSubmit = useCallback(() => {
    form
      .validateFields()
      .then(async (values) => {
        const data: EditableProjectWorkPayload = {
          ...values,
          project: projectId,
          quantity: Number(values.quantity),
          signed: !!values.signed,
        };

        try {
          if (isEditing && initialValues) {
            await updateProjectWorkMutation.mutateAsync({
              projectWorkId: initialValues.project_work_id,
              payload: data,
            });
            notificationApi?.success({
              message: "Успешно",
              description: "Работа в спецификации обновлена",
              placement: "bottomRight",
              duration: 2,
            });
          } else {
            await createProjectWorkMutation.mutateAsync(data);
            notificationApi?.success({
              message: "Успешно",
              description: "Работа добавлена в спецификацию",
              placement: "bottomRight",
              duration: 2,
            });
          }

          onSave();
          form.resetFields();
        } catch (error) {
          const description =
            error instanceof Error
              ? error.message
              : "Возникла ошибка при сохранении работы";
          notificationApi?.error({
            message: "Ошибка",
            description,
            placement: "bottomRight",
            duration: 2,
          });
        }
      })
      .catch((info) => {
        console.log("Validate Failed:", info);
      });
  }, [
    form,
    projectId,
    isEditing,
    initialValues,
    onSave,
    updateProjectWorkMutation,
    notificationApi,
    createProjectWorkMutation,
  ]);

  return (
    <Modal
      className="project-work-modal"
      title={isEditing ? "Редактировать запись" : "Добавить запись"}
      visible={visible}
      onOk={handleSubmit}
      onCancel={onCancel}
      okText="Сохранить"
      cancelText="Отмена"
      width={isMobile() ? "90%" : "50%"}
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
          <EnhancedSelect
            filterOption={customSelectFilterHandler}
            className="work-select"
            options={worksOptions}
            showSearch
            optionFilterProp="title" // Используем title для поиска
            optionLabelProp="title" // Используем title для отображения в поле
            dropdownClassName="work-dropdown"
            style={{ width: "100%" }}
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
        <Form.Item
          name="signed"
          label="Согласовано"
          valuePropName="checked" // Важно для Checkbox
        >
          <Checkbox>Согласовано</Checkbox>
        </Form.Item>
      </Form>
    </Modal>
  );
};
