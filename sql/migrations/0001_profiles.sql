create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  user_id text not null unique,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table profiles enable row level security;

create policy profiles_select on profiles for select to authenticated using (
  (current_setting('request.jwt.claims', true)::json->>'sub') = user_id
);

create policy profiles_insert on profiles for insert to authenticated with check (
  (current_setting('request.jwt.claims', true)::json->>'sub') = user_id
);

create policy profiles_update on profiles for update to authenticated using (
  (current_setting('request.jwt.claims', true)::json->>'sub') = user_id
) with check (
  (current_setting('request.jwt.claims', true)::json->>'sub') = user_id
);

create policy profiles_delete on profiles for delete to authenticated using (
  (current_setting('request.jwt.claims', true)::json->>'sub') = user_id
);
