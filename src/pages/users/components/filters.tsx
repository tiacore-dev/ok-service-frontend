import { ArrowDownOutlined, ArrowUpOutlined } from "@ant-design/icons";
import { Button, Input, Select, Space } from "antd";
import * as React from "react";
import { useSelector } from "react-redux";
import { isMobile } from "../../../utils/isMobile";
import { EditableUserDialog } from "../../../components/ActionDialogs/EditableUserDialog/EditableUserDialog";
import { getCurrentRole } from "../../../store/modules/auth";
import { RoleId } from "../../../interfaces/roles/IRole";
import type {
  IUsersFiltersState,
  UsersSortField,
} from "../../../interfaces/users/IUsersFiltersState";

interface UsersFiltersProps {
  filtersState: IUsersFiltersState;
  onFiltersChange: (filters: IUsersFiltersState) => void;
  roleOptions: Array<{ label: string; value: string }>;
  cityOptions: Array<{ label: string; value: string }>;
  categoryOptions: Array<{ label: string; value: number }>;
}

export const Filters: React.FC<UsersFiltersProps> = ({
  filtersState,
  onFiltersChange,
  roleOptions,
  cityOptions,
  categoryOptions,
}) => {
  const currentRole = useSelector(getCurrentRole);
  const changeFilters = (patch: Partial<IUsersFiltersState>) => {
    onFiltersChange({ ...filtersState, ...patch });
  };

  const sortButtonIcon =
    filtersState.sortOrder === "ascend" ? <ArrowUpOutlined /> : <ArrowDownOutlined />;

  return (
    <Space
      direction={isMobile() ? "vertical" : "horizontal"}
      className="users_filters"
      wrap
    >
      <Input
        allowClear
        placeholder="Поиск по имени или логину"
        value={filtersState.search}
        onChange={(event) => changeFilters({ search: event.target.value })}
        className="users_filters_input"
      />
      <Select
        allowClear
        className="users_filters_select"
        placeholder="Категория"
        value={filtersState.category ?? undefined}
        onChange={(value) =>
          changeFilters({
            category: typeof value === "number" ? value : null,
          })
        }
        options={categoryOptions}
      />
      <Select
        allowClear
        className="users_filters_select"
        placeholder="Роль"
        value={filtersState.roleId}
        onChange={(value) => changeFilters({ roleId: value })}
        options={roleOptions}
      />
      <Select
        allowClear
        className="users_filters_select"
        placeholder="Город"
        value={filtersState.cityId}
        onChange={(value) => changeFilters({ cityId: value })}
        options={cityOptions}
      />
      <Select
        className="users_filters_sort"
        value={filtersState.sortField}
        onChange={(value: UsersSortField) => changeFilters({ sortField: value })}
        options={[
          { label: "Сортировка: по имени", value: "name" },
          { label: "Сортировка: по логину", value: "login" },
          { label: "Сортировка: по категории", value: "category" },
          { label: "Сортировка: по роли", value: "role" },
          { label: "Сортировка: по городу", value: "city" },
        ]}
      />
      <Button
        onClick={() =>
          changeFilters({
            sortOrder: filtersState.sortOrder === "ascend" ? "descend" : "ascend",
          })
        }
        icon={sortButtonIcon}
      >
        {filtersState.sortOrder === "ascend" ? "По возрастанию" : "По убыванию"}
      </Button>
      {currentRole === RoleId.ADMIN && <EditableUserDialog />}
    </Space>
  );
};
