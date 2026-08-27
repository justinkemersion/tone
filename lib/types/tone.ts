export type TunerMode = "guitar" | "chromatic";
export type ThemePreference = "system" | "light" | "dark";
export type EntityStatus = "draft" | "active" | "archived";

export type UserPreferencesRow = {
  id: string;
  user_id: string;
  reference_hz: number;
  default_tuning_id: string;
  tuner_mode: TunerMode;
  theme: ThemePreference;
  created_at: string;
  updated_at: string;
};

export type CustomTuningRow = {
  id: string;
  user_id: string;
  name: string;
  notes: string[];
  status: EntityStatus;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
};

export type TuningFavoriteRow = {
  id: string;
  user_id: string;
  preset_id: string | null;
  custom_tuning_id: string | null;
  created_at: string;
};

export type RecordingRow = {
  id: string;
  user_id: string;
  title: string;
  status: EntityStatus;
  archived_at: string | null;
  r2_key: string | null;
  content_type: string | null;
  byte_size: number | null;
  created_at: string;
  updated_at: string;
};
