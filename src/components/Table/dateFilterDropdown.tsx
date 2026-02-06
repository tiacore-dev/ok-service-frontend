import * as React from "react";
import { DatePicker, Button } from "antd";
import { FilterConfirmProps } from "antd/es/table/interface";
import { Dayjs } from "dayjs";
import "./tableFilters.less";

interface IDateFilterDropdownProps {
  setSelectedKeys: (selectedKeys: React.Key[]) => void;
  selectedKeys: React.Key[];
  confirm: (param?: FilterConfirmProps) => void;
  clearFilters?: () => void;
}

export const dateFilterDropdown = ({
  setSelectedKeys,
  confirm,
  clearFilters,
}: IDateFilterDropdownProps) => {
  const handleRangeChange = (date: Dayjs | null, dateString: string) => {
    if (dateString) {
      setSelectedKeys([dateString]);
      confirm();
    }
  };

  return (
    <div className="table-filter">
      <DatePicker
        onChange={handleRangeChange}
        className="table-filter__picker"
      />
      <Button
        type="primary"
        onClick={() => confirm()}
        size="small"
        className="table-filter__button table-filter__button--spaced"
      >
        Фильтр
      </Button>
      <Button
        onClick={() => {
          if (clearFilters) clearFilters();
          confirm();
        }}
        size="small"
        className="table-filter__button"
      >
        Сбросить
      </Button>
    </div>
  );
};
