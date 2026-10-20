export interface IProjectSpecificationImportWork {
  project_work_id: string;
  project_work_name: string;
  work: string;
  quantity: number;
  price?: number | null;
}

export interface IProjectSpecificationImportMaterial {
  project_material_id: string;
  project_material_name?: string;
  material: string;
  quantity: number;
  price?: number | null;
  project_work?: string | null;
}

export interface IProjectSpecificationUnresolvedItem {
  kind: "work" | "material";
  name: string;
  quantity?: number | null;
  price?: number | null;
  project_work?: string | null;
  reason: string;
}

export interface IProjectSpecificationImportPayload {
  project_works: IProjectSpecificationImportWork[];
  project_materials: IProjectSpecificationImportMaterial[];
}

export interface IProjectSpecificationParseResult
  extends IProjectSpecificationImportPayload {
  unresolved_items?: IProjectSpecificationUnresolvedItem[];
}

export interface IProjectSpecificationImportResponse {
  project_works_created: number;
  project_materials_created: number;
}
