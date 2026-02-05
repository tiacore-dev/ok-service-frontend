export interface IWorkMaterialRelation {
  work_material_relation_id?: string;
  work: string;
  material: string;
  quantity: number;
  created_at?: number;
  created_by?: string;
}
