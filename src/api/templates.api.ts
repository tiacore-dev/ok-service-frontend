import { apiClient } from "./base";
import type {
  ITemplate,
  ITemplateFormValues,
  ITemplateParametersResponse,
  ITemplateType,
} from "../interfaces/templates/ITemplate";

export const fetchTemplateTypes = async (): Promise<ITemplateType[]> => {
  const { data } = await apiClient.get<{ template_types: ITemplateType[] }>(
    "/templates/types/all",
  );
  return data.template_types;
};

export const fetchTemplates = async (
  templateType: string,
): Promise<ITemplate[]> => {
  const { data } = await apiClient.get<{ templates: ITemplate[] }>(
    "/templates/all",
    {
      params: { template_type: templateType, offset: 0, limit: 100 },
    },
  );
  return data.templates;
};

export const downloadTemplate = (templateId: string) =>
  apiClient.get<Blob>(`/templates/${templateId}/download`, {
    responseType: "blob",
  });

const appendFormValues = (formData: FormData, values: ITemplateFormValues) => {
  formData.append("name", values.name);
  formData.append("template_type", values.template_type);
  if (values.description) formData.append("description", values.description);
  if (values.output_file_name)
    formData.append("output_file_name", values.output_file_name);
  formData.append("is_horizontal", String(Boolean(values.is_horizontal)));
  formData.append("is_pdf", String(Boolean(values.is_pdf)));
  formData.append("is_default", String(Boolean(values.is_default)));
};

export const createTemplate = async ({
  file,
  values,
}: {
  file: File;
  values: ITemplateFormValues;
}): Promise<ITemplate> => {
  const formData = new FormData();
  formData.append("file", file);
  appendFormValues(formData, values);
  const { data } = await apiClient.post<ITemplate>("/templates/add", formData);
  return data;
};

export const updateTemplate = async ({
  templateId,
  file,
  values,
}: {
  templateId: string;
  file?: File;
  values: Omit<ITemplateFormValues, "template_type">;
}): Promise<ITemplate> => {
  const formData = new FormData();
  if (file) formData.append("file", file);
  formData.append("data", JSON.stringify(values));
  const { data } = await apiClient.patch<ITemplate>(
    `/templates/${templateId}/edit`,
    formData,
  );
  return data;
};

export const deleteTemplate = (templateId: string) =>
  apiClient.delete(`/templates/${templateId}/delete/hard`);

export const fetchTemplateParameters = async (
  templateType: string,
): Promise<ITemplateParametersResponse> => {
  const { data } = await apiClient.get<ITemplateParametersResponse>(
    "/templates/params",
    { params: { template_type: templateType } },
  );
  return data;
};
