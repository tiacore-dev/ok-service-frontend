import { ReloadOutlined } from "@ant-design/icons";
import { Button, DatePicker, Select, Space, TreeSelect } from "antd";
import type { TreeSelectProps } from "antd";
import type { DataNode } from "antd/es/tree";
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
  projectNamesMap: Record<string, string>;
}

export const ShiftReportsFilters: React.FC<ShiftReportsFiltersProps> = ({
  filtersState,
  onFiltersChange,
  userOptions,
  projectsTreeData,
  objectProjectsMap,
  projectNamesMap,
}) => {
  const changeFilters = (patch: Partial<IShiftReportsFiltersState>) => {
    onFiltersChange({ ...filtersState, ...patch });
  };

  const userNamesMap = React.useMemo(() => {
    return userOptions.reduce<Record<string, string>>((acc, option) => {
      acc[option.value] = option.label;
      return acc;
    }, {});
  }, [userOptions]);

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
          selected.add(projectId)
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

  const renderCompactTag = (
    label: string,
    extra: number,
    closable: boolean,
    onClose?: (event: React.MouseEvent<HTMLElement>) => void
  ) => (
    <span className="shift-reports_filters_tag">
      {extra > 0 ? `${label}` : label}
      {closable && (
        <button
          type="button"
          className="shift-reports_filters_tag-close"
          onClick={(e) => {
            e.stopPropagation();
            onClose?.(e as any);
          }}
        >
          ×
        </button>
      )}
    </span>
  );

  const renderSummaryChip = (
    key: string,
    label: string,
    onRemove: () => void
  ): React.ReactNode => (
    <button
      key={key}
      type="button"
      className="shift-reports_filters_summaryChip"
      onClick={onRemove}
    >
      {label}
      <span className="shift-reports_filters_summaryChip-close">×</span>
    </button>
  );

  return (
    <>
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
          maxTagCount={1}
          tagRender={(props) => {
            if (!filtersState.users.length) return null;
            const first = filtersState.users[0];
            if (props.value !== first) {
              return null;
            }
            const label = userNamesMap[first] || "Сотрудник";
            const extra = filtersState.users.length - 1;
            return renderCompactTag(
              label,
              extra,
              props.closable,
              props.onClose
            );
          }}
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
          showSearch
          treeNodeFilterProp="title"
          maxTagCount={1}
          tagRender={(props) => {
            if (!filtersState.projects.length) return null;
            const first = filtersState.projects[0];
            if (props.value !== first) {
              return null;
            }
            const label = projectNamesMap[first] || "Спецификация";
            const extra = filtersState.projects.length - 1;
            return renderCompactTag(
              label,
              extra,
              props.closable,
              props.onClose
            );
          }}
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
          onClick={() =>
            onFiltersChange({ ...defaultShiftReportsFiltersState })
          }
        >
          Сбросить
        </Button>
      </Space>
      {(filtersState.users.length > 0 || filtersState.projects.length > 0) && (
        <div className="shift-reports_filters_summary">
          {filtersState.users.length > 0 && (
            <div className="shift-reports_filters_summaryRow">
              <span className="shift-reports_filters_summaryLabel">
                Сотрудники:
              </span>
              <div className="shift-reports_filters_summaryChips">
                {filtersState.users.map((userId) =>
                  renderSummaryChip(
                    userId,
                    userNamesMap[userId] || userId,
                    () =>
                      changeFilters({
                        users: filtersState.users.filter((id) => id !== userId),
                      })
                  )
                )}
              </div>
            </div>
          )}
          {filtersState.projects.length > 0 && (
            <div className="shift-reports_filters_summaryRow">
              <span className="shift-reports_filters_summaryLabel">
                Спецификации:
              </span>
              <div className="shift-reports_filters_summaryChips">
                {filtersState.projects.map((projectId) =>
                  renderSummaryChip(
                    projectId,
                    projectNamesMap[projectId] || projectId,
                    () =>
                      changeFilters({
                        projects: filtersState.projects.filter(
                          (id) => id !== projectId
                        ),
                      })
                  )
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};
