import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import { Button, DatePicker, Input, Select, Space } from "antd";
import dayjs, { type Dayjs } from "dayjs";
import * as React from "react";
import type {
  ILeavesFiltersState,
  LeavesSortField,
} from "../../../interfaces/leaves/ILeavesFiltersState";
import type { LeaveReasonId } from "../../../interfaces/leaveReasones/ILeaveReason";
import { isMobile } from "../../../utils/isMobile";

const { RangePicker } = DatePicker;

interface LeavesFiltersProps {
  filtersState: ILeavesFiltersState;
  onFiltersChange: (filters: ILeavesFiltersState) => void;
  reasonOptions: Array<{ label: string; value: LeaveReasonId }>;
}

export const Filters: React.FC<LeavesFiltersProps> = ({
  filtersState,
  onFiltersChange,
  reasonOptions,
}) => {
  const changeFilters = (patch: Partial<ILeavesFiltersState>) => {
    onFiltersChange({ ...filtersState, ...patch });
  };

  const sortButtonIcon =
    filtersState.sortOrder === "ascend" ? (
      <ArrowUpOutlined />
    ) : (
      <ArrowDownOutlined />
    );

  const rangeValue = React.useMemo<[Dayjs | null, Dayjs | null]>(() => {
    if (!filtersState.dateFrom && !filtersState.dateTo) {
      return [null, null];
    }
    return [
      filtersState.dateFrom ? dayjs(filtersState.dateFrom) : null,
      filtersState.dateTo ? dayjs(filtersState.dateTo) : null,
    ];
  }, [filtersState.dateFrom, filtersState.dateTo]);

  return (
    <Space
      direction={isMobile() ? "vertical" : "horizontal"}
      className="leaves_filters"
      wrap
    >
      <Input
        allowClear
        placeholder="Поиск по сотруднику или комментарию"
        value={filtersState.search}
        onChange={(event) => changeFilters({ search: event.target.value })}
        className="leaves_filters_input"
      />
      <Select
        allowClear
        className="leaves_filters_select"
        placeholder="Причина"
        value={filtersState.reasonId}
        onChange={(value: LeaveReasonId | undefined) =>
          changeFilters({ reasonId: value })
        }
        options={reasonOptions}
      />
      <RangePicker
        value={rangeValue}
        onChange={(value) => {
          const [start, end] = value ?? [];
          changeFilters({
            dateFrom: start ? start.startOf("day").valueOf() : null,
            dateTo: end ? end.endOf("day").valueOf() : null,
          });
        }}
        className="leaves_filters_range"
        placeholder={["Дата с", "Дата по"]}
        suffixIcon={<CalendarOutlined />}
        allowClear
      />
      <Select
        className="leaves_filters_sort"
        value={filtersState.sortField}
        onChange={(value: LeavesSortField) =>
          changeFilters({ sortField: value })
        }
        options={[
          { label: "Сортировка: по сотруднику", value: "user" },
          { label: "Сортировка: по причине", value: "reason" },
          { label: "Сортировка: по дате с", value: "start_date" },
          { label: "Сортировка: по дате по", value: "end_date" },
        ]}
      />
      <Button
        onClick={() =>
          changeFilters({
            sortOrder:
              filtersState.sortOrder === "ascend" ? "descend" : "ascend",
          })
        }
        icon={sortButtonIcon}
      >
        {filtersState.sortOrder === "ascend" ? "По возрастанию" : "По убыванию"}
      </Button>
    </Space>
  );
};
