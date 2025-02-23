import { Checkbox, Form, Input, InputNumber, Select } from "antd";
import { CheckboxChangeEvent } from "antd/es/checkbox";
import * as React from "react";
import { selectFilterHandler } from "../../utils/selectFilterHandler";

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
    record[dataIndex] = event.target.value;
  };

  const handleInputNumberChange = (value: number) => {
    record[dataIndex] = value;
  };

  const handleCheckboxChange = (event: CheckboxChangeEvent) => {
    record[dataIndex] = event.target.checked;
  };

  const handleSelectChange = (value: string) => {
    // Для Select значение передается напрямую
    record[dataIndex] = value;
  };

  let inputNode;
  if (record) {
    if (type === "input") {
      if (inputType === "checkbox") {
        inputNode = (
          <Checkbox
            checked={record[dataIndex]}
            onChange={handleCheckboxChange}
          />
        );
      } else if (inputType === "number") {
        inputNode = (
          <InputNumber
            onChange={handleInputNumberChange}
            value={record[dataIndex]}
          />
        );
      } else {
        inputNode = (
          <Input onChange={handleInputChange} value={record[dataIndex]} />
        );
      }
    } else if (type === "select") {
      inputNode = (
        <Select
          showSearch
          filterOption={selectFilterHandler}
          onChange={handleSelectChange}
          value={record[dataIndex]}
          options={options}
        />
      );
    }
  }

  // console.log("Editing:", editing);
  // console.log("DataIndex:", dataIndex);
  // console.log("Record:", record);
  // console.log("Children:", children);

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
