export interface IProjectMaterial {
  project_material_id?: string;
  project: string;
  material: string;
  quantity: number;
  price?: number;
  summ?: number;
  project_work?: string | null;
  created_at?: number;
  created_by?: string;
}
