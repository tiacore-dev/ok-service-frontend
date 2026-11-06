import * as React from "react";
import { Breadcrumb, Button, Form, Input, Layout, Modal, Table } from "antd";
import { SendOutlined } from "@ant-design/icons";
import { usersDesktopColumns } from "./components/desktop.columns";
import { useDispatch, useSelector } from "react-redux";
import { IState } from "../../store/modules";
import { Filters } from "./components/filters";
import "./users.page.less";
import { useNavigate } from "react-router-dom";
import { isMobile } from "../../utils/isMobile";
import { usersMobileColumns } from "./components/mobile.columns";
import { IUsersListColumn } from "../../interfaces/users/IUsersList";
import { Link } from "react-router-dom";
import { saveUsersFiltersState } from "../../store/modules/settings/users";
import { useUsersQuery } from "../../queries/users";
import { useRoles } from "../../queries/roles";
import { useCitiesMap } from "../../queries/cities";
import { usePositionsMap } from "../../queries/positions";
import { categoryMap } from "../../utils/categoryMap";
import type { IUsersFiltersState } from "../../interfaces/users/IUsersFiltersState";
import { getCurrentRole } from "../../store/modules/auth";
import { RoleId } from "../../interfaces/roles/IRole";
import { useSendBulkNotificationMutation } from "../../queries/notifications";

export const Users = () => {
  const { Content } = Layout;
  const navigate = useNavigate();
  const currentRole = useSelector(getCurrentRole);
  const sendBulkNotification = useSendBulkNotificationMutation();
  const [selectedUserIds, setSelectedUserIds] = React.useState<string[]>([]);
  const [bulkOpen, setBulkOpen] = React.useState(false);
  const [bulkForm] = Form.useForm<{
    title: string;
    text: string;
    link?: string;
  }>();
  const { data: usersList, isFetching } = useUsersQuery();

  const dispatch = useDispatch();

  const usersData: IUsersListColumn[] = React.useMemo(
    () => (usersList ?? []).map((doc) => ({ ...doc, key: doc.user_id })),
    [usersList],
  );
  const { rolesMap, roleOptions } = useRoles();
  const { citiesMap, cityOptions } = useCitiesMap();
  const { positionsMap } = usePositionsMap();
  const filtersState = useSelector(
    (state: IState) => state.settings.usersSettings.usersFilters,
  );

  const columns = React.useMemo(
    () =>
      isMobile()
        ? usersMobileColumns(navigate, rolesMap, citiesMap, positionsMap)
        : usersDesktopColumns(navigate, rolesMap, citiesMap, positionsMap),
    [navigate, rolesMap, citiesMap, positionsMap],
  );

  const handleFiltersChange = React.useCallback(
    (nextFilters: IUsersFiltersState) => {
      dispatch(saveUsersFiltersState(nextFilters));
    },
    [dispatch],
  );

  const categoryOptions = React.useMemo(
    () =>
      categoryMap.map((category) => ({
        label: category.label,
        value: category.value,
      })),
    [],
  );

  const roleSelectOptions = React.useMemo(
    () =>
      roleOptions.map((option) => ({
        label: option.label,
        value: option.value,
      })),
    [roleOptions],
  );

  const citySelectOptions = React.useMemo(
    () =>
      cityOptions.map((option) => ({
        label: option.label,
        value: option.value,
      })),
    [cityOptions],
  );

  const filteredUsersData: IUsersListColumn[] = React.useMemo(() => {
    const searchValue = filtersState.search.trim().toLowerCase();

    const filtered = usersData.filter((user) => {
      const matchesSearch = searchValue
        ? user.name.toLowerCase().includes(searchValue) ||
          user.login.toLowerCase().includes(searchValue)
        : true;
      const matchesRole = filtersState.roleId
        ? user.role === filtersState.roleId
        : true;
      const matchesCity = filtersState.cityId
        ? user.city === filtersState.cityId
        : true;
      const matchesCategory =
        filtersState.category !== null && filtersState.category !== undefined
          ? user.category === filtersState.category
          : true;
      const matchesDeleted =
        filtersState.deletedFilter === "all"
          ? true
          : filtersState.deletedFilter === "deleted"
            ? user.deleted
            : filtersState.deletedFilter === "inactive"
              ? !user.deleted && !user.is_active
              : !user.deleted && user.is_active;

      return (
        matchesSearch &&
        matchesRole &&
        matchesCity &&
        matchesCategory &&
        matchesDeleted
      );
    });

    const compareText = (first: string, second: string, direction: number) =>
      first.localeCompare(second, undefined, { sensitivity: "base" }) *
      direction;

    const sorted = [...filtered].sort((a, b) => {
      const direction = filtersState.sortOrder === "ascend" ? 1 : -1;
      switch (filtersState.sortField) {
        case "login":
          return compareText(a.login ?? "", b.login ?? "", direction);
        case "category":
          return ((a.category ?? -1) - (b.category ?? -1)) * direction;
        case "role":
          return compareText(
            rolesMap[a.role]?.name ?? "",
            rolesMap[b.role]?.name ?? "",
            direction,
          );
        case "city":
          return compareText(
            a.city ? citiesMap[a.city]?.name ?? "" : "",
            b.city ? citiesMap[b.city]?.name ?? "" : "",
            direction,
          );
        case "name":
        default:
          return compareText(a.name ?? "", b.name ?? "", direction);
      }
    });

    return sorted;
  }, [usersData, filtersState, rolesMap, citiesMap]);

  const handleBulkSend = async (values: {
    title: string;
    text: string;
    link?: string;
  }) => {
    await sendBulkNotification.mutateAsync({
      recipient_user_ids: selectedUserIds,
      title: values.title,
      text: values.text,
      ...(values.link?.trim() ? { link: values.link.trim() } : {}),
      idempotency_key: crypto.randomUUID(),
    });
    setBulkOpen(false);
    bulkForm.resetFields();
    setSelectedUserIds([]);
  };

  return (
    <>
      <Breadcrumb
        className="breadcrumb"
        items={[
          { title: <Link to="/home">Главная</Link> },
          { title: "Пользователи" },
        ]}
      />
      <Content className="users">
        <Filters
          filtersState={filtersState}
          onFiltersChange={handleFiltersChange}
          roleOptions={roleSelectOptions}
          cityOptions={citySelectOptions}
          categoryOptions={categoryOptions}
        />
        <Table
          dataSource={filteredUsersData}
          columns={columns}
          rowSelection={
            currentRole === RoleId.ADMIN
              ? {
                  selectedRowKeys: selectedUserIds,
                  onChange: (keys) => setSelectedUserIds(keys as string[]),
                }
              : undefined
          }
          loading={isFetching}
          pagination={false}
          rowClassName={(record) =>
            record.deleted ? "users__table__row--deleted" : ""
          }
        />
        {currentRole === RoleId.ADMIN && (
          <Button
            type="primary"
            icon={<SendOutlined />}
            disabled={!selectedUserIds.length}
            onClick={() => setBulkOpen(true)}
            style={{ marginTop: 12 }}
          >
            Отправить уведомление
          </Button>
        )}
        <Modal
          title={`Новое уведомление (${selectedUserIds.length})`}
          open={bulkOpen}
          onCancel={() => setBulkOpen(false)}
          footer={null}
          destroyOnClose
        >
          <Form form={bulkForm} layout="vertical" onFinish={handleBulkSend}>
            <Form.Item
              name="title"
              label="Заголовок"
              rules={[{ required: true }]}
            >
              <Input maxLength={200} />
            </Form.Item>
            <Form.Item name="text" label="Текст" rules={[{ required: true }]}>
              <Input.TextArea rows={4} maxLength={2000} />
            </Form.Item>
            <Form.Item name="link" label="Ссылка">
              <Input placeholder="Необязательно" />
            </Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={sendBulkNotification.isPending}
            >
              Отправить
            </Button>
          </Form>
        </Modal>
      </Content>
    </>
  );
};
