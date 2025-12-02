-- Enable PostGIS for location features
create extension if not exists postgis;

-- Create Profiles table (Publicly visible profile info, linked to Auth)
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  pseudonym text unique,
  avatar_seed text,
  updated_at timestamp with time zone,
  
  constraint username_length check (char_length(pseudonym) >= 3)
);

-- Enable RLS on Profiles
alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );

-- Create Boards table
create table public.boards (
  id uuid default gen_random_uuid() primary key,
  slug text unique not null,
  creator_id uuid references public.profiles(id) not null,
  title text not null,
  settings jsonb default '{"privacy": "public"}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  constraint slug_length check (char_length(slug) = 6)
);

-- Enable RLS on Boards
alter table public.boards enable row level security;

create policy "Boards are viewable by everyone."
  on boards for select
  using ( true );

create policy "Authenticated users can create boards."
  on boards for insert
  with check ( auth.uid() = creator_id );

-- Create Messages table
create table public.messages (
  id uuid default gen_random_uuid() primary key,
  author_id uuid references public.profiles(id) not null,
  board_id uuid references public.boards(id), -- Nullable for General Feed
  content text not null,
  location geography(Point),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on Messages
alter table public.messages enable row level security;

create policy "Messages are viewable by everyone."
  on messages for select
  using ( true );

create policy "Authenticated users can insert messages."
  on messages for insert
  with check ( auth.uid() = author_id );

-- Function to handle new user signup (Trigger)
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, pseudonym, avatar_seed)
  values (new.id, 'User ' || substr(new.id::text, 1, 6), new.id::text);
  return new;
end;
$$ language plpgsql security definer;

-- Trigger the function every time a user is created
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
