export interface IAttachment {
  attachment_id: string;
  name: string;
  file_size: number;
  checksum: string;
  created_at: number;
  created_by: string;
  meta: Record<string, unknown>;
}
