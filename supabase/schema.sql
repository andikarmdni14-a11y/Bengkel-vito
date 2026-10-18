-- =====================================================================
-- FitoMotor: skema database (Supabase / PostgreSQL)
-- Jalankan di Supabase Dashboard -> SQL Editor, SEBELUM seed.sql.
-- Aman dijalankan ulang (idempotent).
-- =====================================================================

create extension if not exists pgcrypto;

-- ---------- products ----------
create table if not exists public.products (
  id          uuid primary key default gen_random_uuid(),
  name        text    not null check (char_length(name) between 1 and 120),
  category    text    not null,
  price       integer not null check (price >= 0),          -- Rupiah
  description text    not null default '',
  image_url   text,
  stock       integer not null default 0 check (stock >= 0),
  sort_order  integer not null default 0,                    -- urutan tampil di katalog
  created_at  timestamptz not null default now()
);

-- ---------- services ----------
create table if not exists public.services (
  id          uuid primary key default gen_random_uuid(),
  name        text    not null check (char_length(name) between 1 and 120),
  price       integer not null check (price >= 0),           -- Rupiah (tarif dasar)
  duration    integer not null check (duration > 0),         -- estimasi, menit
  description text    not null default '',
  icon        text,                                          -- kunci ikon: wrench | circle-gauge | cog
  details     text[]  not null default '{}',                 -- poin rincian di halaman Layanan
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now()
);

-- ---------- bookings ----------
create table if not exists public.bookings (
  id         uuid primary key default gen_random_uuid(),
  user_name  text not null check (char_length(user_name) between 1 and 80),
  phone      text not null check (char_length(regexp_replace(phone, '\D', '', 'g')) between 10 and 15),
  service_id uuid not null references public.services (id),
  motor      text not null check (char_length(motor) between 1 and 80),
  "date"     date not null,
  "time"     text not null check ("time" ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'),
  status     text not null default 'pending'
             check (status in ('pending', 'confirmed', 'completed', 'cancelled')),
  created_at timestamptz not null default now()
);

-- Nama harus unik: mencegah data dobel (mis. seed dijalankan berulang).
-- Jika perintah ini error "could not create unique index ... duplicate key", berarti data sudah terlanjur dobel:
-- jalankan supabase/fix_duplicates.sql dulu, baru jalankan ulang file ini.
create unique index if not exists products_name_uidx on public.products (name);
create unique index if not exists services_name_uidx on public.services (name);

create index if not exists bookings_date_idx on public.bookings ("date");
create index if not exists bookings_service_idx on public.bookings (service_id);

-- ---------- Row Level Security ----------
alter table public.products enable row level security;
alter table public.services enable row level security;
alter table public.bookings enable row level security;

-- Katalog & layanan: publik boleh MEMBACA saja. Ubah data lewat Dashboard / service_role.
drop policy if exists "products_public_read" on public.products;
create policy "products_public_read" on public.products
  for select to anon, authenticated using (true);

drop policy if exists "services_public_read" on public.services;
create policy "services_public_read" on public.services
  for select to anon, authenticated using (true);

-- Booking: pengunjung anonim hanya boleh MENAMBAH (status wajib 'pending', tanggal tidak boleh lampau).
-- TIDAK ada policy SELECT/UPDATE/DELETE untuk anon, sehingga nomor telepon pelanggan tidak bisa dibaca publik.
-- Admin membaca & mengubah status lewat Dashboard (atau service_role di server).
drop policy if exists "bookings_public_insert" on public.bookings;
create policy "bookings_public_insert" on public.bookings
  for insert to anon, authenticated
  with check (status = 'pending' and "date" >= current_date);

-- Hak akses tabel (dilapisi RLS di atas)
revoke all on public.products, public.services, public.bookings from anon, authenticated;
grant select on public.products, public.services to anon, authenticated;
grant insert on public.bookings to anon, authenticated;
