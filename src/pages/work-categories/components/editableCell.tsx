import { Form, Input } from "antd";
import * as React from "react";

interface IEditableCellProps {
  editing: boolean;
  dataIndex: string;
  title: string;
  inputType?: string;
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
  record,
  index,
  children,
  ...restProps
}: IEditableCellProps) => {
  const inputNode = <Input />;
  return (
    <td {...restProps}>
      {editing ? (
        <Form.Item
          name={dataIndex}
          style={{ margin: 0 }}
          rules={[
            {
              required: true,
              message: `Пожалуйста, введите ${title}!`,
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
