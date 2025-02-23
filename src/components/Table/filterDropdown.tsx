import { SearchOutlined } from "@ant-design/icons";
import { Button, Input } from "antd";
import { FilterConfirmProps } from "antd/es/table/interface";
import * as React from "react";

interface IFilterDropdownProps {
  setSelectedKeys: (selectedKeys: React.Key[]) => void;
  selectedKeys: React.Key[];
  confirm: (param?: FilterConfirmProps) => void;
  clearFilters?: () => void;
}

export const filterDropdown = ({
  setSelectedKeys,
  selectedKeys,
  confirm,
  clearFilters,
}: IFilterDropdownProps) => (
  <div style={{ padding: 8 }}>
    <Input
      placeholder="Поиск"
      value={selectedKeys[0]}
      onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
      onPressEnter={() => confirm()}
      style={{ width: 188, marginBottom: 8, display: "block" }}
    />
    <Button
      type="primary"
      onClick={() => confirm()}
      icon={<SearchOutlined />}
      size="small"
      style={{ width: 90, marginRight: 8 }}
    >
      Поиск
    </Button>
    <Button
      onClick={() => {
        clearFilters();
        confirm();
      }}
      size="small"
      style={{ width: 90 }}
    >
      Сбросить
    </Button>
  </div>
);
