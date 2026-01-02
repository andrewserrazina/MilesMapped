create extension if not exists pgcrypto;

-- Profiles map to auth users.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  name text,
  role text not null default 'agent',
  created_at timestamptz not null default now()
);

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  phone text,
  status text not null,
  assigned_agent_id uuid references public.profiles(id),
  preferences jsonb not null default '{}'::jsonb,
  balances jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

comment on column public.clients.assigned_agent_id is
  'TS types currently use assignedAgentName; migrate to assignedAgentId (uuid) by joining profiles on name/email and storing profiles.id here.';

create table if not exists public.trips (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  title text not null,
  origin text not null,
  destination text not null,
  date_start date not null,
  date_end date not null,
  flexibility_days integer not null,
  passengers integer not null,
  cabin_pref text not null,
  cash_budget numeric,
  status text not null,
  assigned_agent_id uuid references public.profiles(id),
  notes text,
  intake jsonb not null default '{}'::jsonb,
  pinned_award_option_id uuid,
  created_at timestamptz not null default now()
);

comment on column public.trips.assigned_agent_id is
  'TS types currently use assignedAgentName; plan: update types to assignedAgentId and hydrate assignedAgentName from profiles.name in queries.';

create table if not exists public.award_options (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  program text not null,
  route text not null,
  miles_required integer not null,
  fees_usd numeric not null,
  cash_equivalent_usd numeric,
  transfer_required boolean not null default false,
  transfer_time text not null,
  badges text[] not null default '{}'::text[],
  created_at timestamptz not null default now()
);

create table if not exists public.hotel_options (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  name text not null,
  points_per_night integer not null,
  cash_alt_usd numeric not null,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.itineraries (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  generated_at timestamptz not null default now(),
  option_a_id uuid not null,
  backup_option_ids uuid[] not null default '{}'::uuid[],
  notes text
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references public.clients(id) on delete cascade,
  trip_id uuid references public.trips(id) on delete cascade,
  title text not null,
  status text not null default 'Open',
  due_date date,
  created_at timestamptz not null default now()
);

create table if not exists public.knowledge_articles (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null,
  content text not null,
  tags text[] not null default '{}'::text[],
  created_at timestamptz not null default now()
);

create table if not exists public.communications (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  trip_id uuid references public.trips(id) on delete cascade,
  type text not null,
  summary text not null,
  created_at timestamptz not null default now(),
  created_by uuid references public.profiles(id)
);

create index if not exists trips_client_id_idx on public.trips (client_id);
create index if not exists trips_assigned_agent_id_idx on public.trips (assigned_agent_id);
create index if not exists award_options_trip_id_idx on public.award_options (trip_id);
create index if not exists itineraries_trip_id_idx on public.itineraries (trip_id);
create index if not exists tasks_due_date_idx on public.tasks (due_date);

alter table public.profiles enable row level security;
alter table public.clients enable row level security;
alter table public.trips enable row level security;
alter table public.award_options enable row level security;
alter table public.hotel_options enable row level security;
alter table public.itineraries enable row level security;
alter table public.tasks enable row level security;
alter table public.knowledge_articles enable row level security;
alter table public.communications enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
  );
$$;

create or replace function public.is_agent()
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'agent'
  );
$$;

-- Profiles policies
create policy profiles_admin_all
  on public.profiles
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy profiles_self_select
  on public.profiles
  for select
  to authenticated
  using (id = auth.uid());

create policy profiles_self_insert
  on public.profiles
  for insert
  to authenticated
  with check (id = auth.uid());

create policy profiles_self_update
  on public.profiles
  for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- Clients policies
create policy clients_admin_all
  on public.clients
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy clients_agent_select
  on public.clients
  for select
  to authenticated
  using (public.is_agent() and assigned_agent_id = auth.uid());

-- Trips policies
create policy trips_admin_all
  on public.trips
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy trips_agent_select
  on public.trips
  for select
  to authenticated
  using (public.is_agent() and assigned_agent_id = auth.uid());

create policy trips_agent_update
  on public.trips
  for update
  to authenticated
  using (public.is_agent() and assigned_agent_id = auth.uid())
  with check (
    public.is_agent()
    and assigned_agent_id = auth.uid()
    and status <> 'Closed'
  );

-- Award options policies
create policy award_options_admin_all
  on public.award_options
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy award_options_agent_select
  on public.award_options
  for select
  to authenticated
  using (
    public.is_agent()
    and exists (
      select 1
      from public.trips
      where public.trips.id = public.award_options.trip_id
        and public.trips.assigned_agent_id = auth.uid()
    )
  );

create policy award_options_agent_insert
  on public.award_options
  for insert
  to authenticated
  with check (
    public.is_agent()
    and exists (
      select 1
      from public.trips
      where public.trips.id = public.award_options.trip_id
        and public.trips.assigned_agent_id = auth.uid()
    )
  );

-- Hotel options policies
create policy hotel_options_admin_all
  on public.hotel_options
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy hotel_options_agent_select
  on public.hotel_options
  for select
  to authenticated
  using (
    public.is_agent()
    and exists (
      select 1
      from public.trips
      where public.trips.id = public.hotel_options.trip_id
        and public.trips.assigned_agent_id = auth.uid()
    )
  );

-- Itineraries policies
create policy itineraries_admin_all
  on public.itineraries
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy itineraries_agent_select
  on public.itineraries
  for select
  to authenticated
  using (
    public.is_agent()
    and exists (
      select 1
      from public.trips
      where public.trips.id = public.itineraries.trip_id
        and public.trips.assigned_agent_id = auth.uid()
    )
  );

-- Tasks policies
create policy tasks_admin_all
  on public.tasks
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy tasks_agent_select
  on public.tasks
  for select
  to authenticated
  using (
    public.is_agent()
    and (
      (public.tasks.trip_id is not null and exists (
        select 1
        from public.trips
        where public.trips.id = public.tasks.trip_id
          and public.trips.assigned_agent_id = auth.uid()
      ))
      or (public.tasks.client_id is not null and exists (
        select 1
        from public.clients
        where public.clients.id = public.tasks.client_id
          and public.clients.assigned_agent_id = auth.uid()
      ))
    )
  );

-- Knowledge articles policies
create policy knowledge_articles_admin_all
  on public.knowledge_articles
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy knowledge_articles_read_authenticated
  on public.knowledge_articles
  for select
  to authenticated
  using (auth.uid() is not null);

-- Communications policies
create policy communications_admin_all
  on public.communications
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy communications_agent_select
  on public.communications
  for select
  to authenticated
  using (
    public.is_agent()
    and (
      (public.communications.trip_id is not null and exists (
        select 1
        from public.trips
        where public.trips.id = public.communications.trip_id
          and public.trips.assigned_agent_id = auth.uid()
      ))
      or (public.communications.client_id is not null and exists (
        select 1
        from public.clients
        where public.clients.id = public.communications.client_id
          and public.clients.assigned_agent_id = auth.uid()
      ))
    )
  );
