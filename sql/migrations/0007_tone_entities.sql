-- Tone domain: preferences, custom tunings, favorites, recording metadata stub.
-- Unqualified names; Flux applies these in the tenant API schema.

create table if not exists user_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id text not null unique,
  reference_hz numeric not null default 440
    check (reference_hz >= 390 and reference_hz <= 480),
  default_tuning_id text not null default 'standard',
  tuner_mode text not null default 'guitar'
    check (tuner_mode in ('guitar', 'chromatic')),
  theme text not null default 'system'
    check (theme in ('system', 'light', 'dark')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table user_preferences enable row level security;

create policy user_preferences_select on user_preferences for select to authenticated using (
  (current_setting('request.jwt.claims', true)::json->>'sub') = user_id
);
create policy user_preferences_insert on user_preferences for insert to authenticated with check (
  (current_setting('request.jwt.claims', true)::json->>'sub') = user_id
);
create policy user_preferences_update on user_preferences for update to authenticated using (
  (current_setting('request.jwt.claims', true)::json->>'sub') = user_id
) with check (
  (current_setting('request.jwt.claims', true)::json->>'sub') = user_id
);
create policy user_preferences_delete on user_preferences for delete to authenticated using (
  (current_setting('request.jwt.claims', true)::json->>'sub') = user_id
);

create table if not exists custom_tunings (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  name text not null,
  notes jsonb not null,
  status text not null default 'active' check (status in ('draft', 'active', 'archived')),
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists custom_tunings_user_status_idx on custom_tunings (user_id, status);
create index if not exists custom_tunings_user_created_idx on custom_tunings (user_id, created_at desc);

alter table custom_tunings enable row level security;

create policy custom_tunings_select on custom_tunings for select to authenticated using (
  (current_setting('request.jwt.claims', true)::json->>'sub') = user_id
);
create policy custom_tunings_insert on custom_tunings for insert to authenticated with check (
  (current_setting('request.jwt.claims', true)::json->>'sub') = user_id
);
create policy custom_tunings_update on custom_tunings for update to authenticated using (
  (current_setting('request.jwt.claims', true)::json->>'sub') = user_id
) with check (
  (current_setting('request.jwt.claims', true)::json->>'sub') = user_id
);
create policy custom_tunings_delete on custom_tunings for delete to authenticated using (
  (current_setting('request.jwt.claims', true)::json->>'sub') = user_id
);

create table if not exists tuning_favorites (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  preset_id text,
  custom_tuning_id uuid references custom_tunings (id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint tuning_favorites_one_target check (
    (preset_id is not null and custom_tuning_id is null)
    or (preset_id is null and custom_tuning_id is not null)
  )
);

create unique index if not exists tuning_favorites_user_preset_idx
  on tuning_favorites (user_id, preset_id) where preset_id is not null;
create unique index if not exists tuning_favorites_user_custom_idx
  on tuning_favorites (user_id, custom_tuning_id) where custom_tuning_id is not null;

alter table tuning_favorites enable row level security;

create policy tuning_favorites_select on tuning_favorites for select to authenticated using (
  (current_setting('request.jwt.claims', true)::json->>'sub') = user_id
  and (
    custom_tuning_id is null
    or exists (
      select 1 from custom_tunings t
      where t.id = custom_tuning_id
        and t.user_id = (current_setting('request.jwt.claims', true)::json->>'sub')
    )
  )
);
create policy tuning_favorites_insert on tuning_favorites for insert to authenticated with check (
  (current_setting('request.jwt.claims', true)::json->>'sub') = user_id
  and (
    custom_tuning_id is null
    or exists (
      select 1 from custom_tunings t
      where t.id = custom_tuning_id
        and t.user_id = (current_setting('request.jwt.claims', true)::json->>'sub')
    )
  )
);
create policy tuning_favorites_update on tuning_favorites for update to authenticated using (
  (current_setting('request.jwt.claims', true)::json->>'sub') = user_id
  and (
    custom_tuning_id is null
    or exists (
      select 1 from custom_tunings t
      where t.id = custom_tuning_id
        and t.user_id = (current_setting('request.jwt.claims', true)::json->>'sub')
    )
  )
) with check (
  (current_setting('request.jwt.claims', true)::json->>'sub') = user_id
  and (
    custom_tuning_id is null
    or exists (
      select 1 from custom_tunings t
      where t.id = custom_tuning_id
        and t.user_id = (current_setting('request.jwt.claims', true)::json->>'sub')
    )
  )
);
create policy tuning_favorites_delete on tuning_favorites for delete to authenticated using (
  (current_setting('request.jwt.claims', true)::json->>'sub') = user_id
  and (
    custom_tuning_id is null
    or exists (
      select 1 from custom_tunings t
      where t.id = custom_tuning_id
        and t.user_id = (current_setting('request.jwt.claims', true)::json->>'sub')
    )
  )
);

-- Metadata only. Object bytes live in R2 when credentials exist; never implied by this table.
create table if not exists recordings (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  title text not null,
  status text not null default 'draft' check (status in ('draft', 'active', 'archived')),
  archived_at timestamptz,
  r2_key text,
  content_type text,
  byte_size integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists recordings_user_created_idx on recordings (user_id, created_at desc);

alter table recordings enable row level security;

create policy recordings_select on recordings for select to authenticated using (
  (current_setting('request.jwt.claims', true)::json->>'sub') = user_id
);
create policy recordings_insert on recordings for insert to authenticated with check (
  (current_setting('request.jwt.claims', true)::json->>'sub') = user_id
);
create policy recordings_update on recordings for update to authenticated using (
  (current_setting('request.jwt.claims', true)::json->>'sub') = user_id
) with check (
  (current_setting('request.jwt.claims', true)::json->>'sub') = user_id
);
create policy recordings_delete on recordings for delete to authenticated using (
  (current_setting('request.jwt.claims', true)::json->>'sub') = user_id
);
