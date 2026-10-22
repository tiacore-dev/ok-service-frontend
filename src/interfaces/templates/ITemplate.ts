export interface ITemplateType {
  value: string;
  label: string;
}

export interface ITemplate {
  id: string;
  name: string;
  description?: string | null;
  template_type: string;
  template_type_label?: string | null;
  s3_key?: string | null;
  file_name?: string | null;
  content_type?: string | null;
  output_file_name?: string | null;
  is_horizontal: boolean;
  is_pdf: boolean;
  is_default: boolean;
}

export interface ITemplateFormValues {
  name: string;
  template_type: string;
  description?: string;
  output_file_name?: string;
  is_horizontal?: boolean;
  is_pdf?: boolean;
  is_default?: boolean;
}

export interface ITemplateParametersResponse {
  template_type: string;
  parameters: string[];
  schema: Record<string, unknown>;
}

export interface ITemplateGenerationPayload {
  template_id: string;
  template_type: string;
  parameters: Record<string, unknown>;
  is_pdf?: boolean;
}
