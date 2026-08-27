create table if not exists records (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  title text not null,
  description text,
  status text not null default 'draft' check (status in ('draft', 'active', 'archived')),
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists records_user_status_idx on records (user_id, status);
create index if not exists records_user_created_idx on records (user_id, created_at desc);

create table if not exists record_tags (
  id uuid primary key default gen_random_uuid(),
  record_id uuid not null references records (id) on delete cascade,
  user_id text not null,
  tag text not null,
  created_at timestamptz not null default now(),
  unique (record_id, tag)
);

create index if not exists record_tags_user_tag_idx on record_tags (user_id, tag);

create table if not exists notes (
  id uuid primary key default gen_random_uuid(),
  record_id uuid references records (id) on delete cascade,
  user_id text not null,
  body text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists notes_user_created_idx on notes (user_id, created_at desc);
create index if not exists notes_record_idx on notes (record_id);

create table if not exists activity_events (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  entity_type text not null,
  entity_id text not null,
  action text not null,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create index if not exists activity_events_user_created_idx on activity_events (user_id, created_at desc);

alter table records enable row level security;
alter table record_tags enable row level security;
alter table notes enable row level security;
alter table activity_events enable row level security;

-- records
create policy records_select on records for select to authenticated using (
  (current_setting('request.jwt.claims', true)::json->>'sub') = user_id
);
create policy records_insert on records for insert to authenticated with check (
  (current_setting('request.jwt.claims', true)::json->>'sub') = user_id
);
create policy records_update on records for update to authenticated using (
  (current_setting('request.jwt.claims', true)::json->>'sub') = user_id
) with check (
  (current_setting('request.jwt.claims', true)::json->>'sub') = user_id
);
create policy records_delete on records for delete to authenticated using (
  (current_setting('request.jwt.claims', true)::json->>'sub') = user_id
);

-- record_tags
create policy record_tags_select on record_tags for select to authenticated using (
  (current_setting('request.jwt.claims', true)::json->>'sub') = user_id
);
create policy record_tags_insert on record_tags for insert to authenticated with check (
  (current_setting('request.jwt.claims', true)::json->>'sub') = user_id
);
create policy record_tags_update on record_tags for update to authenticated using (
  (current_setting('request.jwt.claims', true)::json->>'sub') = user_id
) with check (
  (current_setting('request.jwt.claims', true)::json->>'sub') = user_id
);
create policy record_tags_delete on record_tags for delete to authenticated using (
  (current_setting('request.jwt.claims', true)::json->>'sub') = user_id
);

-- notes
create policy notes_select on notes for select to authenticated using (
  (current_setting('request.jwt.claims', true)::json->>'sub') = user_id
);
create policy notes_insert on notes for insert to authenticated with check (
  (current_setting('request.jwt.claims', true)::json->>'sub') = user_id
);
create policy notes_update on notes for update to authenticated using (
  (current_setting('request.jwt.claims', true)::json->>'sub') = user_id
) with check (
  (current_setting('request.jwt.claims', true)::json->>'sub') = user_id
);
create policy notes_delete on notes for delete to authenticated using (
  (current_setting('request.jwt.claims', true)::json->>'sub') = user_id
);

-- activity_events
create policy activity_events_select on activity_events for select to authenticated using (
  (current_setting('request.jwt.claims', true)::json->>'sub') = user_id
);
create policy activity_events_insert on activity_events for insert to authenticated with check (
  (current_setting('request.jwt.claims', true)::json->>'sub') = user_id
);
create policy activity_events_update on activity_events for update to authenticated using (
  (current_setting('request.jwt.claims', true)::json->>'sub') = user_id
) with check (
  (current_setting('request.jwt.claims', true)::json->>'sub') = user_id
);
create policy activity_events_delete on activity_events for delete to authenticated using (
  (current_setting('request.jwt.claims', true)::json->>'sub') = user_id
);
