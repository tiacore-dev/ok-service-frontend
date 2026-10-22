import * as React from "react";
import {
  Alert,
  Breadcrumb,
  Button,
  Empty,
  Input,
  Layout,
  Select,
  Table,
  Typography,
} from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { getCurrentRole } from "../../store/modules/auth";
import { RoleId } from "../../interfaces/roles/IRole";
import {
  useTemplateParametersQuery,
  useTemplateTypesQuery,
} from "../../queries/templates";

interface ParameterNode {
  key: string;
  technicalName: string;
  label: string;
  example?: unknown;
  children?: ParameterNode[];
}

const asRecord = (value: unknown): Record<string, unknown> | undefined =>
  value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : undefined;

const getSchemaMetadata = (schema: unknown, path: string) => {
  let current = asRecord(schema);
  path.split(".").forEach((segment) => {
    const propertyName = segment.replace("[i]", "");
    current = asRecord(asRecord(current?.properties)?.[propertyName]);
    if (segment.endsWith("[i]")) current = asRecord(current?.items);
  });
  return {
    label: typeof current?.title === "string" ? current.title : undefined,
    example: current?.example,
  };
};

const buildTree = (parameters: string[], schema: unknown) => {
  const roots: ParameterNode[] = [];
  parameters.forEach((parameter) => {
    let siblings = roots;
    let path = "";
    parameter.split(".").forEach((segment, index, parts) => {
      path = path ? `${path}.${segment}` : segment;
      let node = siblings.find((item) => item.key === path);
      if (!node) {
        const metadata = getSchemaMetadata(schema, path);
        node = {
          key: path,
          technicalName: path,
          label: metadata.label ?? path,
          example: metadata.example,
          ...(index < parts.length - 1 ? { children: [] } : {}),
        };
        siblings.push(node);
      }
      if (index < parts.length - 1) {
        node.children ??= [];
        siblings = node.children;
      }
    });
  });
  return roots;
};

const renderExample = (value: unknown) => {
  if (value === undefined || value === null) {
    return "—";
  }
  if (typeof value === "object") {
    return "Вложенная структура";
  }
  return String(value);
};

export const TemplateParameters = () => {
  const { Content } = Layout;
  const navigate = useNavigate();
  const role = useSelector(getCurrentRole);
  const canView = role === RoleId.ADMIN || role === RoleId.MANAGER;
  const [searchParams] = useSearchParams();
  const [templateType, setTemplateType] = React.useState<string | undefined>(
    () => searchParams.get("template_type") ?? undefined,
  );
  const [search, setSearch] = React.useState("");
  const [expandedRowKeys, setExpandedRowKeys] = React.useState<React.Key[]>([]);
  const typesQuery = useTemplateTypesQuery(canView);
  const parametersQuery = useTemplateParametersQuery(templateType);
  const parameters = parametersQuery.data?.parameters ?? [];
  const treeData = React.useMemo(
    () =>
      buildTree(
        search.trim()
          ? parameters.filter((item) =>
              item.toLowerCase().includes(search.trim().toLowerCase()),
            )
          : parameters,
        parametersQuery.data?.schema,
      ),
    [parameters, parametersQuery.data?.schema, search],
  );
  React.useEffect(() => {
    const keys: React.Key[] = [];
    const collectKeys = (nodes: ParameterNode[]) => {
      nodes.forEach((node) => {
        if (node.children?.length) {
          keys.push(node.key);
          collectKeys(node.children);
        }
      });
    };
    collectKeys(treeData);
    setExpandedRowKeys(keys);
  }, [treeData]);

  return (
    <>
      <Breadcrumb
        className="breadcrumb"
        items={[
          { title: <Link to="/home">Главная</Link> },
          { title: <Link to="/templates">Шаблоны</Link> },
          { title: "Параметры шаблонов" },
        ]}
      />
      <Content className="templates">
        {!canView ? (
          <Typography.Text>
            Раздел доступен администратору и менеджеру.
          </Typography.Text>
        ) : typesQuery.isError ? (
          <Alert
            type="error"
            message="Не удалось загрузить типы шаблонов"
            showIcon
          />
        ) : (
          <>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate("/templates")}
              style={{ marginRight: 8 }}
              type="link"
            >
              Назад
            </Button>
            <Select
              placeholder="Выберите тип"
              options={(typesQuery.data ?? []).map((item) => ({
                label: item.label,
                value: item.value,
              }))}
              value={templateType}
              onChange={setTemplateType}
              loading={typesQuery.isPending}
              style={{ width: 320, marginBottom: 8 }}
            />
            {templateType && (
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                allowClear
                placeholder="Поиск по техническому имени"
                style={{ width: 320, marginLeft: 8 }}
              />
            )}
            {!templateType ? (
              <Empty
                className="templates__empty"
                description="Выберите тип шаблона"
              />
            ) : parametersQuery.isError ? (
              <Alert
                type="error"
                message="Не удалось загрузить параметры шаблона"
                showIcon
              />
            ) : (
              <Table<ParameterNode>
                rowKey="key"
                dataSource={treeData}
                loading={parametersQuery.isPending}
                columns={[
                  {
                    title: "Параметр",
                    dataIndex: "label",
                    key: "label",
                    width: "42%",
                  },
                  {
                    title: "Путь в шаблоне",
                    dataIndex: "technicalName",
                    key: "technicalName",
                    width: "35%",
                    render: (value: string) => (
                      <Typography.Text code copyable={{ text: value }}>
                        {value}
                      </Typography.Text>
                    ),
                  },
                  {
                    title: "Пример",
                    dataIndex: "example",
                    key: "example",
                    width: "23%",
                    render: renderExample,
                  },
                ]}
                pagination={false}
                tableLayout="fixed"
                expandable={{
                  expandedRowKeys,
                  onExpandedRowsChange: (keys) => setExpandedRowKeys([...keys]),
                  rowExpandable: (record) => Boolean(record.children?.length),
                }}
                locale={{ emptyText: "Параметры не найдены" }}
              />
            )}
          </>
        )}
      </Content>
    </>
  );
};
