import { Form, Input, Select } from "antd";
import * as React from "react";

interface IEditableCellProps {
  editing: boolean;
  dataIndex: string;
  title: string;
  type?: "input" | "select";
  options?: { label: string; value: string }[];
  inputType?: "text" | "number";
  required?: boolean;
  record: any;
  index: number;
  children: Array<React.ReactNode>;
  [key: string]: any;
}

export const EditableCell = ({
  editing,
  dataIndex,
  title,
  type = "input",
  options,
  inputType,
  required,
  record,
  index,
  children,
  ...restProps
}: IEditableCellProps) => {
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // Преобразуем значение в число перед сохранением
    const value = event.target.value;
    record[dataIndex] = inputType === "number" ? Number(value) : value;
  };

  const handleSelectChange = (value: string) => {
    // Для Select значение передается напрямую
    record[dataIndex] = value;
  };

  let inputNode;

  if (type === "input") {
    inputNode = <Input onChange={handleInputChange} type={inputType} />;
  } else if (type === "select") {
    inputNode = <Select onChange={handleSelectChange} options={options} />;
  }

  return (
    <td {...restProps}>
      {editing ? (
        <Form.Item
          name={dataIndex}
          style={{ margin: 0 }}
          rules={[
            {
              required,
              message: `Поле '${title}' обязательно для заполнения!`,
            },
          ]}
        >
          {inputNode}
        </Form.Item>
      ) : options ? (
        options.find((el) => el.value === children[1].toString())?.label
      ) : (
        children
      )}
    </td>
  );
};
