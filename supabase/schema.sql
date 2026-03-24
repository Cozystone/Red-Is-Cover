-- Projects table
create table if not exists projects (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  status text not null default 'upcoming',
  category text not null,
  description text default '',
  concept text default '',
  image_url text,
  tags text[] default '{}',
  year text default '',
  featured boolean default false,
  display_order integer default 0,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Background images table
create table if not exists background_images (
  id uuid default gen_random_uuid() primary key,
  url text not null,
  alt text default '',
  active boolean default true,
  display_order integer default 0,
  created_at timestamp with time zone default now()
);

-- Enable RLS
alter table projects enable row level security;
alter table background_images enable row level security;

-- Public read access
create policy "Public can read projects"
  on projects for select using (true);

create policy "Public can read background_images"
  on background_images for select using (true);

-- Authenticated write access
create policy "Auth users can manage projects"
  on projects for all using (auth.role() = 'authenticated');

create policy "Auth users can manage background_images"
  on background_images for all using (auth.role() = 'authenticated');
