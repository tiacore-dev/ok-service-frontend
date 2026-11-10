import * as React from "react";
import { Alert, Table } from "antd";
import type { ColumnsType, ColumnType } from "antd/es/table";
import {
  DeleteOutlined,
  FolderOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import type { IWorkCategoriesList } from "../../../interfaces/workCategories/IWorkCategoriesList";
import type { IWorksListColumn } from "../../../interfaces/works/IWorksList";
import type { WorksFiltersState } from "../../../interfaces/works/IWorksFiltersState";
import {
  buildWorksTree,
  canMoveCategory,
  canMoveWork,
  expandableWorkTreeKeys,
  type WorksTreeRow,
} from "../../../utils/workCategoryTree";
import {
  useMoveWorkMutation,
  useMoveWorkCategoryMutation,
} from "../../../queries/workTreeMoves";
import { NotificationContext } from "../../../contexts/NotificationContext";
import { getApiErrorMessage } from "../../../utils/getApiErrorMessage";
import "./WorksTreeTable.less";

interface WorksTreeTableProps {
  categories: IWorkCategoriesList[];
  works: IWorksListColumn[];
  filters: WorksFiltersState;
  columns: ColumnsType<IWorksListColumn>;
  loading: boolean;
  canEdit: boolean;
}

export const WorksTreeTable = ({
  categories,
  works,
  filters,
  columns,
  loading,
  canEdit,
}: WorksTreeTableProps) => {
  const tree = React.useMemo(
    () => buildWorksTree(categories, works, filters),
    [categories, works, filters],
  );
  const notificationApi = React.useContext(NotificationContext);
  const updateWork = useMoveWorkMutation();
  const updateCategory = useMoveWorkCategoryMutation();
  const [dragged, setDragged] = React.useState<WorksTreeRow | null>(null);
  const dragRef = React.useRef<WorksTreeRow | null>(null);
  const [dropTarget, setDropTarget] = React.useState<string | null>(null);
  const [movingKey, setMovingKey] = React.useState<string | null>(null);
  const moveInProgress = React.useRef(false);
  const filterKey = JSON.stringify([
    filters.search.trim(),
    filters.categoryId,
    filters.deletedFilter,
  ]);
  const [expansion, setExpansion] = React.useState<{
    filterKey: string;
    keys: React.Key[];
  }>({ filterKey: "", keys: [] });
  const expandedKeys =
    expansion.filterKey === filterKey
      ? expansion.keys
      : filters.search.trim() || filters.categoryId
        ? expandableWorkTreeKeys(tree)
        : [];
  const enabled = canEdit && !loading && !movingKey;

  const finishDrag = () => {
    dragRef.current = null;
    setDragged(null);
    setDropTarget(null);
  };

  const acceptsDrop = (parentId: string | null) => {
    const source = dragRef.current;
    if (!enabled || !source || moveInProgress.current) return false;
    if (source.kind === "category") {
      return canMoveCategory(
        categories,
        source.category.work_category_id,
        parentId,
      );
    }
    return canMoveWork(categories, source.work, parentId);
  };

  const handleDragOver = (event: React.DragEvent, parentId: string | null) => {
    event.stopPropagation();
    if (acceptsDrop(parentId)) {
      event.preventDefault();
      event.dataTransfer.dropEffect = "move";
      setDropTarget(parentId ?? "root");
    } else {
      event.dataTransfer.dropEffect = "none";
      setDropTarget(null);
    }
  };

  const handleDrop = async (
    event: React.DragEvent,
    parentId: string | null,
  ) => {
    event.preventDefault();
    event.stopPropagation();
    const allowed = acceptsDrop(parentId);
    const source = dragRef.current;
    finishDrag();
    if (!allowed || !source) return;
    moveInProgress.current = true;
    setMovingKey(source.key);
    try {
      if (source.kind === "category") {
        await updateCategory.mutateAsync({
          categoryId: source.category.work_category_id,
          parentId,
        });
      } else if (parentId) {
        await updateWork.mutateAsync({
          workId: source.work.work_id,
          category: categories.find(
            (category) => category.work_category_id === parentId,
          )!,
        });
      }
      // Reveal the destination after a successful move, preserving other expanded branches.
      if (parentId) {
        setExpansion({
          filterKey,
          keys: Array.from(new Set([...expandedKeys, `category-${parentId}`])),
        });
      }
      notificationApi?.success({
        message: "Перемещено",
        placement: "bottomRight",
        duration: 2,
      });
    } catch (error) {
      notificationApi?.error({
        message: "Не удалось переместить",
        description: getApiErrorMessage(error, "Попробуйте ещё раз"),
        placement: "bottomRight",
      });
    } finally {
      moveInProgress.current = false;
      setMovingKey(null);
    }
  };

  const treeColumns: ColumnsType<WorksTreeRow> = columns.map((base, index) => {
    const column = base as ColumnType<IWorksListColumn>;
    return {
      key: column.key,
      width: column.width,
      align: column.align,
      title:
        index === 0
          ? "Наименование"
          : typeof column.title === "function"
            ? undefined
            : column.title,
      render: (_: unknown, row: WorksTreeRow, rowIndex: number) => {
        if (row.kind === "category") {
          return index === 0 ? (
            <span className="works-tree__category">
              {movingKey === row.key ? (
                <LoadingOutlined spin aria-label="Сохранение" />
              ) : (
                <FolderOutlined />
              )}
              {row.category.deleted && <DeleteOutlined />} {row.name}
            </span>
          ) : null;
        }
        const content = column.render
          ? (column.render(undefined, row.work, rowIndex) as React.ReactNode)
          : row.name;
        return index === 0 && movingKey === row.key ? (
          <span className="works-tree__saving-cell">
            <LoadingOutlined spin aria-label="Сохранение" />
            {content}
          </span>
        ) : (
          content
        );
      },
    };
  });

  return (
    <div className="works-tree">
      {!categories.length && !loading && (
        <Alert
          type="info"
          showIcon
          message="Создайте категории работ, чтобы организовать дерево"
        />
      )}
      <Table<WorksTreeRow>
        pagination={false}
        columns={treeColumns}
        dataSource={tree}
        loading={loading}
        expandable={{
          expandedRowKeys: expandedKeys,
          onExpandedRowsChange: (keys) =>
            setExpansion({ filterKey, keys: [...keys] }),
          indentSize: 20,
        }}
        rowClassName={(row) =>
          [
            row.kind === "category" ? "works-tree__category-row" : "",
            dragged?.key === row.key ? "works-tree__dragging" : "",
            row.kind === "category" &&
            dropTarget === row.category.work_category_id
              ? "works-tree__drop-target"
              : "",
          ].join(" ")
        }
        onHeaderRow={() => ({
          className: dropTarget === "root" ? "works-tree__drop-target" : "",
          onDragOver: (event) => handleDragOver(event, null),
          onDragLeave: () => setDropTarget(null),
          onDrop: (event) => {
            void handleDrop(event, null);
          },
        })}
        onRow={(row) => ({
          draggable:
            enabled &&
            (row.kind === "work"
              ? Boolean(row.work.work_id)
              : !row.category.deleted),
          onDragStart: (event) => {
            if (!enabled) {
              event.preventDefault();
              return;
            }
            dragRef.current = row;
            setDragged(row);
            event.dataTransfer.effectAllowed = "move";
            event.dataTransfer.setData("text/plain", row.key);
          },
          onDragEnd: finishDrag,
          onDragOver: (event) => {
            if (row.kind === "category")
              handleDragOver(event, row.category.work_category_id);
            else {
              event.dataTransfer.dropEffect = "none";
              setDropTarget(null);
            }
          },
          onDragLeave: (event) => {
            if (!event.currentTarget.contains(event.relatedTarget as Node))
              setDropTarget(null);
          },
          onDrop: (event) => {
            if (row.kind === "category")
              void handleDrop(event, row.category.work_category_id);
            else {
              event.preventDefault();
              finishDrag();
            }
          },
        })}
      />
    </div>
  );
};
