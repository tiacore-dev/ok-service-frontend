import * as React from "react";
import dayjs, { Dayjs } from "dayjs";
import {
  Breadcrumb,
  Button,
  Checkbox,
  DatePicker,
  Form,
  Input,
  Layout,
  Modal,
  Popconfirm,
  Space,
  Table,
  Tag,
  Typography,
} from "antd";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { getCurrentRole } from "../../store/modules/auth";
import { RoleId } from "../../interfaces/roles/IRole";
import { dateTimestampToLocalDateTimeString } from "../../utils/dateConverter";
import {
  useAddApiKeyPermissionsManyMutation,
  useApiKeyPermissionRelationsQuery,
  useApiKeyPermissionTypesQuery,
  useApiKeysQuery,
  useDeleteApiKeyMutation,
  useGenerateApiKeyMutation,
} from "../../queries/apiKeys";
import type { IApiKey } from "../../interfaces/apiKeys/IApiKey";
import type { IApiKeyPermissionRelation } from "../../interfaces/apiKeys/IApiKeyPermissionRelation";
import "./api-keys.page.less";

interface GenerateFormValues {
  name?: string;
  expiresAt?: Dayjs;
}

const formatTimestamp = (timestamp?: number) => {
  if (!timestamp) {
    return "-";
  }
  return dateTimestampToLocalDateTimeString(timestamp * 1000);
};

export const ApiKeys = () => {
  const { Content } = Layout;
  const currentRole = useSelector(getCurrentRole);
  const isAdmin = currentRole === RoleId.ADMIN;
  const [form] = Form.useForm<GenerateFormValues>();

  const [isCreateModalOpen, setCreateModalOpen] = React.useState(false);
  const [isPermissionsModalOpen, setPermissionsModalOpen] =
    React.useState(false);
  const [selectedKey, setSelectedKey] = React.useState<IApiKey | null>(null);
  const [createPermissionTypeIds, setCreatePermissionTypeIds] = React.useState<
    string[]
  >([]);
  const [selectedPermissionTypeIds, setSelectedPermissionTypeIds] =
    React.useState<string[]>([]);
  const [generatedToken, setGeneratedToken] = React.useState<string | null>(
    null,
  );

  const { data: apiKeysData, isFetching } = useApiKeysQuery();
  const { data: permissionTypesData } = useApiKeyPermissionTypesQuery();
  const { data: permissionRelationsData, refetch: refetchPermissionRelations } =
    useApiKeyPermissionRelationsQuery();

  const generateApiKeyMutation = useGenerateApiKeyMutation();
  const deleteApiKeyMutation = useDeleteApiKeyMutation();
  const addPermissionsManyMutation = useAddApiKeyPermissionsManyMutation();

  const permissionTypes = permissionTypesData ?? [];
  const permissionRelations = permissionRelationsData ?? [];
  const apiKeys = apiKeysData ?? [];

  const permissionTypeMap = React.useMemo(
    () =>
      permissionTypes.reduce<Record<string, (typeof permissionTypes)[number]>>(
        (acc, permissionType) => {
          acc[permissionType.permission_type_id] = permissionType;
          return acc;
        },
        {},
      ),
    [permissionTypes],
  );

  const relationsByKey = React.useMemo(
    () =>
      permissionRelations.reduce<Record<string, IApiKeyPermissionRelation[]>>(
        (acc, relation) => {
          if (!acc[relation.api_key_id]) {
            acc[relation.api_key_id] = [];
          }
          acc[relation.api_key_id].push(relation);
          return acc;
        },
        {},
      ),
    [permissionRelations],
  );

  const allPermissionTypeIds = React.useMemo(
    () =>
      permissionTypes.map(
        (permissionType) => permissionType.permission_type_id,
      ),
    [permissionTypes],
  );

  const rows = React.useMemo(
    () =>
      apiKeys.map((apiKey) => {
        const relations = relationsByKey[apiKey.api_key_id] ?? [];
        const permissions = relations
          .map((relation) => permissionTypeMap[relation.permission_type_id])
          .filter(Boolean);
        return {
          ...apiKey,
          key: apiKey.api_key_id,
          relations,
          permissions,
        };
      }),
    [apiKeys, permissionTypeMap, relationsByKey],
  );

  const togglePermissionTypeId = React.useCallback(
    (
      permissionTypeId: string,
      setSelectedIds: React.Dispatch<React.SetStateAction<string[]>>,
    ) => {
      setSelectedIds((prev) =>
        prev.includes(permissionTypeId)
          ? prev.filter((id) => id !== permissionTypeId)
          : [...prev, permissionTypeId],
      );
    },
    [],
  );

  const handleCreateApiKey = React.useCallback(async () => {
    const values = await form.validateFields();
    const response = await generateApiKeyMutation.mutateAsync({
      name: values.name?.trim() || undefined,
      expires_at: values.expiresAt ? values.expiresAt.unix() : undefined,
    });

    if (createPermissionTypeIds.length) {
      await addPermissionsManyMutation.mutateAsync({
        api_key_id: response.api_key_id,
        permission_type_ids: createPermissionTypeIds,
      });
      await refetchPermissionRelations();
    }

    form.resetFields();
    setCreatePermissionTypeIds([]);
    setCreateModalOpen(false);
    setGeneratedToken(response.token);
  }, [
    addPermissionsManyMutation,
    createPermissionTypeIds,
    form,
    generateApiKeyMutation,
    refetchPermissionRelations,
  ]);

  // const openPermissionsModal = React.useCallback(
  //   (apiKey: IApiKey) => {
  //     const keyRelations = relationsByKey[apiKey.api_key_id] ?? [];
  //     setSelectedPermissionTypeIds(
  //       keyRelations.map((relation) => relation.permission_type_id),
  //     );
  //     setSelectedKey(apiKey);
  //     setPermissionsModalOpen(true);
  //   },
  //   [relationsByKey],
  // );

  const handleSavePermissions = React.useCallback(async () => {
    if (!selectedKey) {
      return;
    }

    await addPermissionsManyMutation.mutateAsync({
      api_key_id: selectedKey.api_key_id,
      permission_type_ids: selectedPermissionTypeIds,
    });
    await refetchPermissionRelations();

    setPermissionsModalOpen(false);
    setSelectedKey(null);
    setSelectedPermissionTypeIds([]);
  }, [
    addPermissionsManyMutation,
    refetchPermissionRelations,
    selectedKey,
    selectedPermissionTypeIds,
  ]);

  const createPermissionColumns = React.useMemo(
    () => [
      {
        title: (
          <Checkbox
            checked={
              allPermissionTypeIds.length > 0 &&
              createPermissionTypeIds.length === allPermissionTypeIds.length
            }
            indeterminate={
              createPermissionTypeIds.length > 0 &&
              createPermissionTypeIds.length < allPermissionTypeIds.length
            }
            onChange={(event) =>
              setCreatePermissionTypeIds(
                event.target.checked ? allPermissionTypeIds : [],
              )
            }
          />
        ),
        key: "checked",
        width: 60,
        render: (_: unknown, record: (typeof permissionTypes)[number]) => (
          <Checkbox
            checked={createPermissionTypeIds.includes(
              record.permission_type_id,
            )}
            onChange={() =>
              togglePermissionTypeId(
                record.permission_type_id,
                setCreatePermissionTypeIds,
              )
            }
          />
        ),
      },
      {
        title: "Код",
        dataIndex: "code",
        key: "code",
      },
      {
        title: "Описание",
        dataIndex: "description",
        key: "description",
        render: (value?: string) => value || "-",
      },
    ],
    [
      allPermissionTypeIds,
      createPermissionTypeIds,
      permissionTypes,
      togglePermissionTypeId,
    ],
  );

  const editPermissionColumns = React.useMemo(
    () => [
      {
        title: (
          <Checkbox
            checked={
              allPermissionTypeIds.length > 0 &&
              selectedPermissionTypeIds.length === allPermissionTypeIds.length
            }
            indeterminate={
              selectedPermissionTypeIds.length > 0 &&
              selectedPermissionTypeIds.length < allPermissionTypeIds.length
            }
            onChange={(event) =>
              setSelectedPermissionTypeIds(
                event.target.checked ? allPermissionTypeIds : [],
              )
            }
          />
        ),
        key: "checked",
        width: 60,
        render: (_: unknown, record: (typeof permissionTypes)[number]) => (
          <Checkbox
            checked={selectedPermissionTypeIds.includes(
              record.permission_type_id,
            )}
            onChange={() =>
              togglePermissionTypeId(
                record.permission_type_id,
                setSelectedPermissionTypeIds,
              )
            }
          />
        ),
      },
      {
        title: "Код",
        dataIndex: "code",
        key: "code",
      },
      {
        title: "Описание",
        dataIndex: "description",
        key: "description",
        render: (value?: string) => value || "-",
      },
    ],
    [
      allPermissionTypeIds,
      permissionTypes,
      selectedPermissionTypeIds,
      togglePermissionTypeId,
    ],
  );

  const columns = React.useMemo(
    () => [
      {
        title: "Название",
        dataIndex: "name",
        key: "name",
      },
      {
        title: "Создан",
        dataIndex: "created_at",
        key: "created_at",
        render: (createdAt: number) => formatTimestamp(createdAt),
      },
      {
        title: "Истекает",
        dataIndex: "expires_at",
        key: "expires_at",
        render: (expiresAt: number) => formatTimestamp(expiresAt),
      },
      {
        title: "Права",
        key: "permissions",
        render: (_: unknown, record: (typeof rows)[number]) =>
          record.permissions.length ? (
            <Space size={[4, 4]} wrap>
              {record.permissions.map((permission) => (
                <Tag key={permission.permission_type_id}>{permission.code}</Tag>
              ))}
            </Space>
          ) : (
            "-"
          ),
      },
      {
        title: "",
        key: "actions",
        width: 240,
        render: (_: unknown, record: (typeof rows)[number]) => (
          <Space>
            {/* <Button size="small" onClick={() => openPermissionsModal(record)}>
              Права
            </Button> */}
            <Popconfirm
              title="Удалить API ключ?"
              okText="Удалить"
              cancelText="Отмена"
              onConfirm={() =>
                deleteApiKeyMutation.mutateAsync(record.api_key_id)
              }
            >
              <Button danger size="small">
                Удалить
              </Button>
            </Popconfirm>
          </Space>
        ),
      },
    ],
    [deleteApiKeyMutation, rows],
  );

  return (
    <>
      <Breadcrumb
        className="breadcrumb"
        items={[
          { title: <Link to="/home">Главная</Link> },
          { title: "API ключи" },
        ]}
      />
      <Content className="api-keys">
        {!isAdmin ? (
          <Typography.Text>
            Раздел доступен только администратору.
          </Typography.Text>
        ) : (
          <>
            <div className="api-keys__actions">
              <Button
                type="primary"
                onClick={() => {
                  form.resetFields();
                  setCreatePermissionTypeIds([]);
                  setCreateModalOpen(true);
                }}
              >
                Добавить ключ
              </Button>
            </div>
            <Table
              dataSource={rows}
              columns={columns}
              loading={isFetching}
              pagination={{ pageSize: 20 }}
            />
          </>
        )}
      </Content>

      <Modal
        width={1000}
        title="Создание API ключа"
        open={isCreateModalOpen}
        okText="Создать"
        cancelText="Отмена"
        confirmLoading={
          generateApiKeyMutation.isPending ||
          addPermissionsManyMutation.isPending
        }
        onOk={handleCreateApiKey}
        onCancel={() => {
          form.resetFields();
          setCreatePermissionTypeIds([]);
          setCreateModalOpen(false);
        }}
      >
        <Form form={form} layout="vertical">
          <Form.Item label="Название" name="name">
            <Input placeholder="Например: integration-ci" />
          </Form.Item>
          <Form.Item label="Действует до" name="expiresAt">
            <DatePicker
              className="api-keys__date-picker"
              showTime
              format="DD.MM.YYYY HH:mm"
              disabledDate={(current) =>
                current ? current < dayjs().startOf("day") : false
              }
            />
          </Form.Item>
        </Form>
        <Typography.Text>Права доступа</Typography.Text>
        <Table
          className="api-keys__permissions-table"
          rowKey="permission_type_id"
          size="small"
          dataSource={permissionTypes}
          columns={createPermissionColumns}
          pagination={false}
        />
      </Modal>

      <Modal
        title={
          selectedKey
            ? `Права доступа: ${selectedKey.name}`
            : "Управление правами доступа"
        }
        open={isPermissionsModalOpen}
        okText="Сохранить"
        cancelText="Отмена"
        confirmLoading={addPermissionsManyMutation.isPending}
        onOk={handleSavePermissions}
        onCancel={() => {
          setPermissionsModalOpen(false);
          setSelectedKey(null);
          setSelectedPermissionTypeIds([]);
        }}
      >
        <Table
          className="api-keys__permissions-table"
          rowKey="permission_type_id"
          size="small"
          dataSource={permissionTypes}
          columns={editPermissionColumns}
          pagination={false}
        />
      </Modal>

      <Modal
        title="API ключ создан"
        open={Boolean(generatedToken)}
        footer={null}
        onCancel={() => setGeneratedToken(null)}
      >
        <Typography.Paragraph>
          Сохраните токен, повторно его посмотреть нельзя.
        </Typography.Paragraph>
        <Typography.Text copyable>{generatedToken ?? ""}</Typography.Text>
      </Modal>
    </>
  );
};
