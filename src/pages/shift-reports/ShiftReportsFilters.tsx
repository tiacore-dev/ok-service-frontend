import { ReloadOutlined } from "@ant-design/icons";
import { Button, DatePicker, Select, Space, TreeSelect } from "antd";
import type { DataNode } from "antd/es/tree";
import type { TreeSelectProps } from "antd";
import dayjs, { type Dayjs } from "dayjs";
import * as React from "react";
import { isMobile } from "../../utils/isMobile";
import {
  defaultShiftReportsFiltersState,
  type IShiftReportsFiltersState,
} from "../../interfaces/shiftReports/IShiftReportsFiltersState";

const { RangePicker } = DatePicker;

interface ShiftReportsFiltersProps {
  filtersState: IShiftReportsFiltersState;
  onFiltersChange: (next: IShiftReportsFiltersState) => void;
  userOptions: Array<{ label: string; value: string }>;
  projectsTreeData: DataNode[];
  objectProjectsMap: Record<string, string[]>;
}

export const ShiftReportsFilters: React.FC<ShiftReportsFiltersProps> = ({
  filtersState,
  onFiltersChange,
  userOptions,
  projectsTreeData,
  objectProjectsMap,
}) => {
  const changeFilters = (patch: Partial<IShiftReportsFiltersState>) => {
    onFiltersChange({ ...filtersState, ...patch });
  };

  const handleUsersChange = (value: string[]) => {
    changeFilters({ users: value });
  };

  const handleDateChange = (dates: null | [Dayjs | null, Dayjs | null]) => {
    if (!dates) {
      changeFilters({ dateFrom: null, dateTo: null });
      return;
    }

    const [start, end] = dates;
    changeFilters({
      dateFrom: start ? start.startOf("day").valueOf() : null,
      dateTo: end ? end.endOf("day").valueOf() : null,
    });
  };

  const treeValue = React.useMemo(() => {
    const values = new Set(filtersState.projects);
    Object.entries(objectProjectsMap).forEach(([objectId, projectIds]) => {
      if (
        projectIds.length > 0 &&
        projectIds.every((projectId) => values.has(projectId))
      ) {
        values.add(`object:${objectId}`);
      }
    });
    return Array.from(values);
  }, [filtersState.projects, objectProjectsMap]);

  const handleProjectsChange: TreeSelectProps["onChange"] = (value) => {
    const rawValues = Array.isArray(value)
      ? value
      : value !== undefined && value !== null
        ? [value]
        : [];
    const selected = new Set<string>();

    rawValues.forEach((raw) => {
      const nodeValue = String(raw);
      if (nodeValue.startsWith("object:")) {
        const objectId = nodeValue.replace("object:", "");
        (objectProjectsMap[objectId] ?? []).forEach((projectId) =>
          selected.add(projectId),
        );
      } else {
        selected.add(nodeValue);
      }
    });

    changeFilters({ projects: Array.from(selected) });
  };

  const rangeValue = React.useMemo<[Dayjs | null, Dayjs | null]>(() => {
    return [
      filtersState.dateFrom ? dayjs(filtersState.dateFrom) : null,
      filtersState.dateTo ? dayjs(filtersState.dateTo) : null,
    ];
  }, [filtersState.dateFrom, filtersState.dateTo]);

  return (
    <Space
      className="shift-reports_filters"
      direction={isMobile() ? "vertical" : "horizontal"}
      wrap
    >
      <Select
        mode="multiple"
        allowClear
        placeholder="Выберите сотрудников"
        className="shift-reports_filters_select"
        options={userOptions}
        value={filtersState.users}
        onChange={handleUsersChange}
        showSearch
        optionFilterProp="label"
        maxTagCount="responsive"
      />
      <TreeSelect
        treeCheckable
        showCheckedStrategy={TreeSelect.SHOW_CHILD}
        placeholder="Выберите спецификации"
        className="shift-reports_filters_projectTree"
        treeData={projectsTreeData}
        value={treeValue}
        onChange={handleProjectsChange}
        allowClear
      />
      <RangePicker
        className="shift-reports_filters_range"
        format="DD.MM.YYYY"
        placeholder={["Дата с", "Дата по"]}
        value={rangeValue}
        onChange={handleDateChange}
      />
      <Button
        icon={<ReloadOutlined />}
        onClick={() => onFiltersChange({ ...defaultShiftReportsFiltersState })}
      >
        Сбросить
      </Button>
    </Space>
  );
};
