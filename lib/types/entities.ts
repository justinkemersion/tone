export type RecordStatus = "draft" | "active" | "archived";

export type ProfileRow = {
  id: string;
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
};

export type RecordRow = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  status: RecordStatus;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
};

export type RecordTagRow = {
  id: string;
  record_id: string;
  user_id: string;
  tag: string;
  created_at: string;
};

export type NoteRow = {
  id: string;
  record_id: string | null;
  user_id: string;
  body: string;
  created_at: string;
  updated_at: string;
};

export type ActivityEventRow = {
  id: string;
  user_id: string;
  entity_type: string;
  entity_id: string;
  action: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
};
