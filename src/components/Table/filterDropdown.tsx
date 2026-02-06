import { SearchOutlined } from "@ant-design/icons";
import { Button, Input } from "antd";
import { FilterConfirmProps } from "antd/es/table/interface";
import * as React from "react";
import "./tableFilters.less";

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
  <div className="table-filter">
    <Input
      placeholder="Поиск"
      value={selectedKeys[0]}
      onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
      onPressEnter={() => confirm()}
      className="table-filter__input"
    />
    <Button
      type="primary"
      onClick={() => confirm()}
      icon={<SearchOutlined />}
      size="small"
      className="table-filter__button table-filter__button--spaced"
    >
      Поиск
    </Button>
    <Button
      onClick={() => {
        clearFilters();
        confirm();
      }}
      size="small"
      className="table-filter__button"
    >
      Сбросить
    </Button>
  </div>
);
