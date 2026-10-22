import { PrinterOutlined } from "@ant-design/icons";
import { Alert, Button, Form, Modal, Select, Tooltip } from "antd";
import * as React from "react";
import { useSelector } from "react-redux";
import { NotificationContext } from "../../contexts/NotificationContext";
import { RoleId } from "../../interfaces/roles/IRole";
import {
  useGenerateTemplateMutation,
  useTemplatesQuery,
} from "../../queries/templates";
import { getCurrentRole } from "../../store/modules/auth";

type OutputFormat = "template" | "pdf" | "source";

interface IServerExportForm {
  templateId: string;
  format: OutputFormat;
  [key: string]: unknown;
}

interface TemplateExportButtonProps {
  templateType: string;
  title: string;
  parameters?: Record<string, unknown>;
  getParameters?: (values: IServerExportForm) => Record<string, unknown>;
  parameterFields?: React.ReactNode;
  disabled?: boolean;
  disabledTooltip?: string;
  menuItem?: boolean;
}

const getFileName = (contentDisposition?: string) => {
  const match = contentDisposition?.match(
    /filename\*?=(?:UTF-8''|\")?([^;\"]+)/i,
  );
  if (!match?.[1]) return "export";
  try {
    return decodeURIComponent(match[1].trim());
  } catch {
    return match[1].trim();
  }
};

const getBlobErrorMessage = async (blob: Blob) => {
  try {
    const error = JSON.parse(await blob.text()) as {
      msg?: string;
      detail?: string;
      message?: string;
    };
    return (
      error.msg ??
      error.detail ??
      error.message ??
      "Не удалось сформировать файл"
    );
  } catch {
    return "Не удалось сформировать файл";
  }
};

export const TemplateExportButton = ({
  templateType,
  title,
  parameters,
  getParameters,
  parameterFields,
  disabled = false,
  disabledTooltip,
  menuItem = false,
}: TemplateExportButtonProps) => {
  const currentRole = useSelector(getCurrentRole);
  const canServerExport =
    currentRole === RoleId.ADMIN || currentRole === RoleId.MANAGER;
  const notificationApi = React.useContext(NotificationContext);
  const [isOpen, setIsOpen] = React.useState(false);
  const [form] = Form.useForm<IServerExportForm>();
  const {
    data: templates = [],
    isPending: isTemplatesPending,
    isError: isTemplatesError,
  } = useTemplatesQuery(
    canServerExport && !disabled ? templateType : undefined,
  );
  const generateMutation = useGenerateTemplateMutation();

  if (!canServerExport) return null;

  const openModal = () => {
    const defaultTemplate = templates.find((template) => template.is_default);
    form.setFieldsValue({
      templateId: defaultTemplate?.id ?? templates[0]?.id,
      format: "template",
    });
    setIsOpen(true);
  };

  const handleExport = async () => {
    try {
      const values = await form.validateFields();
      const { templateId, format } = values;
      const response = await generateMutation.mutateAsync({
        template_id: templateId,
        template_type: templateType,
        parameters: getParameters?.(values) ?? parameters ?? {},
        ...(format === "template" ? {} : { is_pdf: format === "pdf" }),
      });

      if (response.status !== 200) {
        notificationApi?.error({
          message: "Не удалось сформировать файл",
          description: await getBlobErrorMessage(response.data),
          placement: "bottomRight",
          duration: 4,
        });
        return;
      }

      const url = URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = url;
      link.download = getFileName(response.headers["content-disposition"]);
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      setIsOpen(false);
    } catch {
      notificationApi?.error({
        message: "Не удалось сформировать файл",
        description: "Попробуйте ещё раз.",
        placement: "bottomRight",
        duration: 4,
      });
    }
  };

  return (
    <>
      {disabledTooltip ? (
        <Tooltip title={disabled ? disabledTooltip : undefined}>
          <span>
            <Button
              block={menuItem}
              type={menuItem ? "text" : "default"}
              icon={<PrinterOutlined />}
              onClick={openModal}
              disabled={disabled}
            >
              Серверный экспорт
            </Button>
          </span>
        </Tooltip>
      ) : (
        <Button
          block={menuItem}
          type={menuItem ? "text" : "default"}
          icon={<PrinterOutlined />}
          onClick={openModal}
          disabled={disabled}
        >
          Серверный экспорт
        </Button>
      )}
      <Modal
        title={`Серверный экспорт — ${title}`}
        open={isOpen}
        onCancel={() => setIsOpen(false)}
        onOk={() => void handleExport()}
        okText="Сформировать"
        cancelText="Отмена"
        confirmLoading={generateMutation.isPending}
        okButtonProps={{
          disabled: isTemplatesPending || isTemplatesError || !templates.length,
        }}
      >
        {isTemplatesError ? (
          <Alert type="error" message="Не удалось загрузить шаблоны" showIcon />
        ) : (
          <Form form={form} layout="vertical">
            <Form.Item
              label="Шаблон"
              name="templateId"
              rules={[{ required: true, message: "Выберите шаблон" }]}
            >
              <Select
                placeholder="Выберите шаблон"
                loading={isTemplatesPending}
                options={templates.map((template) => ({
                  value: template.id,
                  label: template.name,
                }))}
              />
            </Form.Item>
            <Form.Item label="Формат" name="format" initialValue="template">
              <Select
                options={[
                  { value: "template", label: "По настройке шаблона" },
                  { value: "pdf", label: "PDF" },
                  { value: "source", label: "Исходный DOCX/XLSX" },
                ]}
              />
            </Form.Item>
            {parameterFields}
          </Form>
        )}
      </Modal>
    </>
  );
};
