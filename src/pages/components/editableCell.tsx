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
  const form = Form.useFormInstance();
  const defaultValue = form.getFieldValue(dataIndex);
  const [value, setValue] = React.useState(defaultValue);

  React.useEffect(() => {
    setValue(defaultValue);
  }, [defaultValue]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue(value);
    form.setFieldsValue({ [dataIndex]: event.target.value });
  };

  const handleInputNumberChange = (value: number) => {
    setValue(value);
    form.setFieldsValue({ [dataIndex]: value });
  };

  const handleCheckboxChange = (event: CheckboxChangeEvent) => {
    setValue(value);
    form.setFieldsValue({ [dataIndex]: event.target.checked });
  };

  const handleSelectChange = (value: string) => {
    setValue(value);
    form.setFieldsValue({ [dataIndex]: value });
  };

  let inputNode;
  if (record) {
    if (type === "input") {
      if (inputType === "checkbox") {
        inputNode = (
          <Checkbox checked={value} onChange={handleCheckboxChange} />
        );
      } else if (inputType === "number") {
        inputNode = (
          <InputNumber onChange={handleInputNumberChange} value={value} />
        );
      } else {
        inputNode = <Input onChange={handleInputChange} value={value} />;
      }
    } else if (type === "select") {
      inputNode = (
        <Select
          showSearch
          filterOption={selectFilterHandler}
          onChange={handleSelectChange}
          value={value}
          options={options}
        />
      );
    }
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
