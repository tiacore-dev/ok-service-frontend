import { Checkbox, Form, Input, Select } from "antd";
import { CheckboxChangeEvent } from "antd/es/checkbox";
import * as React from "react";

interface IEditableCellProps {
  editing: boolean;
  dataIndex: string;
  title: string;
  type?: "input" | "select";
  options?: { label: string; value: string }[];
  inputType?: "text" | "number" | "checkbox";
  required?: boolean;
  record: any;
  index: number;
  children: Array<string | number | boolean | undefined>;
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

    let value;

    if (inputType === "number") {
      value = Number(event.target.value);
    } else {
      value = event.target.value;
    }

    record[dataIndex] = value;
  };

  const handleCheckboxChange = (event: CheckboxChangeEvent) => {
    // Преобразуем значение в число перед сохранением

    let value = event.target.checked;

    record[dataIndex] = value;
  };

  const handleSelectChange = (value: string) => {
    // Для Select значение передается напрямую
    record[dataIndex] = value;
  };

  let inputNode;

  if (type === "input") {
    if (inputType === "checkbox") {
      inputNode = (
        <Checkbox checked={record[dataIndex]} onChange={handleCheckboxChange} />
      );
    } else {
      inputNode = <Input onChange={handleInputChange} type={inputType} />;
    }
  } else if (type === "select") {
    inputNode = <Select onChange={handleSelectChange} options={options} />;
  }

  return (
    <td {...restProps}>
      {editing ? (
        <Form.Item
          name={dataIndex}
          style={{ margin: 0 }}
          valuePropName={inputType === "checkbox" && "checked"}
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
      ) : inputType === "checkbox" ? (
        <Checkbox checked={!!children[1]} />
      ) : (
        children[1]
      )}
    </td>
  );
};
