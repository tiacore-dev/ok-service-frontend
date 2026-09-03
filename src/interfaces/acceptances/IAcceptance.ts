export type AcceptanceStatus =
  | "presented"
  | "violations_found"
  | "accepted_on_site"
  | "documents_signed";

export interface IAcceptance {
  id: string;
  date: number;
  project_id: string;
  status: AcceptanceStatus;
  comment?: string;
}

export interface EditableAcceptancePayload {
  date: number;
  project_id: string;
  status?: AcceptanceStatus;
  comment?: string;
}

export interface IWorkAcceptanceRelation {
  id: string;
  acceptance_id: string;
  work_id: string;
  quantity: number;
}

export interface IAcceptanceStatusHistory {
  id: string;
  acceptance_id: string;
  changed_at: number;
  changed_by: string;
  from_status: AcceptanceStatus;
  to_status: AcceptanceStatus;
}
