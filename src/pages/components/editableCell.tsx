import { Checkbox, Form, Input, InputNumber, Select } from "antd";
import { CheckboxChangeEvent } from "antd/es/checkbox";
import * as React from "react";
import { selectFilterHandler } from "../../utils/selectFilterHandler";

interface IEditableCellProps {
  editing: boolean;
  dataIndex: string;
  title: string;
  type?: "input" | "select";
  options?: { label: string; value: string; deleted?: boolean }[];
  inputType?: "text" | "number" | "checkbox";
  required?: boolean;
  record: any;
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
  children,
  ...restProps
}: IEditableCellProps) => {
  const form = Form.useFormInstance();
  const value = Form.useWatch(dataIndex, form);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    form.setFieldsValue({ [dataIndex]: event.target.value });
  };

  const handleInputNumberChange = (value: number) => {
    form.setFieldsValue({ [dataIndex]: value });
  };

  const handleCheckboxChange = (event: CheckboxChangeEvent) => {
    form.setFieldsValue({ [dataIndex]: event.target.checked });
  };

  const handleSelectChange = (value: string) => {
    form.setFieldsValue({ [dataIndex]: value });
  };

  const [inputNode, setInputNode] = React.useState<React.ReactElement>(null);

  const selectOptions = options
    ? editing
      ? options.filter((el) => !el.deleted)
      : options
    : undefined;

  React.useEffect(() => {
    if (record) {
      if (type === "input") {
        if (inputType === "checkbox") {
          setInputNode(
            <Checkbox checked={value} onChange={handleCheckboxChange} />,
          );
        } else if (inputType === "number") {
          setInputNode(
            <InputNumber onChange={handleInputNumberChange} value={value} />,
          );
        } else {
          setInputNode(<Input onChange={handleInputChange} value={value} />);
        }
      } else if (type === "select") {
        setInputNode(
          <Select
            showSearch
            filterOption={selectFilterHandler}
            onChange={handleSelectChange}
            value={value}
            options={selectOptions}
          />,
        );
      }
    }
  }, [value]);

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
        options.find((el) => el.value === children[1]?.toString())?.label
      ) : (
        children[1]
      )}
    </td>
  );
};
