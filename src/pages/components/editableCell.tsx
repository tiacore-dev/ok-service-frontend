import { Form, Input } from "antd";
import * as React from "react";

interface IEditableCellProps {
  editing: boolean;
  dataIndex: string;
  title: string;
  inputType?: "text" | "number";
  required?: boolean;
  record: any;
  index: number;
  children: React.ReactNode;
  [key: string]: any;
}

export const EditableCell = ({
  editing,
  dataIndex,
  title,
  inputType,
  required,
  record,
  index,
  children,
  ...restProps
}: IEditableCellProps) => {
  const handleChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      // Преобразуем значение в число перед сохранением
      const value = event.target.value;
      record[dataIndex] = inputType === "number" ? Number(value) : value;
    },
    [record, dataIndex, inputType]
  );

  const inputNode = <Input onChange={handleChange} type={inputType} />;
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
      ) : (
        children
      )}
    </td>
  );
};
