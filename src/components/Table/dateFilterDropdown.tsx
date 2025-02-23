import * as React from "react";
import { DatePicker, Button } from "antd";
import { FilterConfirmProps } from "antd/es/table/interface";
import { Dayjs } from "dayjs";

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
    <div style={{ padding: 8 }}>
      <DatePicker
        onChange={handleRangeChange}
        style={{ marginBottom: 8, display: "block" }}
      />
      <Button
        type="primary"
        onClick={() => confirm()}
        size="small"
        style={{ width: 90, marginRight: 8 }}
      >
        Фильтр
      </Button>
      <Button
        onClick={() => {
          if (clearFilters) clearFilters();
          confirm();
        }}
        size="small"
        style={{ width: 90 }}
      >
        Сбросить
      </Button>
    </div>
  );
};
