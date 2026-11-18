import * as React from "react";
import { Button, Spin, TreeSelect, type TreeSelectProps } from "antd";
import type { BaseSelectRef } from "rc-select";
import type { WorkTreeSelectData } from "../../hooks/useWorkTreeSelectData";
import { matchesWorkSelectSearch } from "../../utils/workSelectTree";
import "./WorkTreeSelect.less";

interface WorkTreeSelectProps extends Pick<
  TreeSelectProps<string>,
  | "value"
  | "id"
  | "onBlur"
  | "onFocus"
  | "disabled"
  | "className"
  | "style"
  | "placeholder"
  | "allowClear"
  | "status"
> {
  data: WorkTreeSelectData;
  onChange?: (value: string | undefined) => void;
}

export const WorkTreeSelect = React.forwardRef<
  BaseSelectRef,
  WorkTreeSelectProps
>(({ data, onChange, placeholder = "Выберите работу", ...props }, ref) => {
  const stateContent = data.loading ? (
    <div className="work-tree-select__state" role="status">
      <Spin size="small" />
      <span>Загрузка работ…</span>
    </div>
  ) : data.error ? (
    <div className="work-tree-select__state" role="alert">
      <span>Не удалось загрузить работы</span>
      <Button
        type="link"
        size="small"
        onMouseDown={(event) => event.preventDefault()}
        onClick={data.retry}
      >
        Повторить
      </Button>
    </div>
  ) : null;
  return (
    <TreeSelect<string>
      {...props}
      ref={ref}
      placeholder={placeholder}
      showSearch
      treeExpandAction="click"
      treeNodeFilterProp="title"
      filterTreeNode={matchesWorkSelectSearch}
      treeNodeLabelProp="title"
      treeData={data.treeData}
      loading={data.loading}
      aria-busy={data.loading}
      popupClassName="work-tree-select__popup"
      notFoundContent={stateContent ?? "Работы не найдены"}
      dropdownRender={(menu) => (
        <>
          {data.treeData.length > 0 && stateContent}
          {menu}
        </>
      )}
      onChange={(value) => {
        if (value == null) onChange?.(undefined);
        else if (data.workIds.has(value)) onChange?.(value);
      }}
    />
  );
});
WorkTreeSelect.displayName = "WorkTreeSelect";
