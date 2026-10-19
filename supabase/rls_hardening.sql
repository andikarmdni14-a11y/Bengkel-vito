-- =====================================================================
-- FitoMotor: penguatan RLS (Row Level Security).
-- Jalankan di Supabase Dashboard -> SQL Editor, SETELAH schema.sql (dan seed.sql). Aman dijalankan ulang.
--
-- KONDISI AWAL: schema.sql SUDAH mengaktifkan RLS dan sudah benar untuk publik:
--   products, services : anon/authenticated hanya SELECT
--   bookings           : anon/authenticated hanya INSERT (status 'pending', tanggal tidak lampau)
-- File ini menambahkan:
--   1) role admin untuk operasi tulis (insert/update/delete), dibaca dari app_metadata JWT
--   2) batas tanggal booking memakai zona waktu WIB (bukan UTC)
-- Admin yang memakai Dashboard / service_role tidak terpengaruh (keduanya melewati RLS).
-- =====================================================================

begin;

-- ---------- 1) Helper: apakah pemanggil adalah admin? ----------
-- Dibaca dari app_metadata (HANYA bisa diubah lewat service_role / SQL). JANGAN pakai user_metadata:
-- pengguna bisa mengubah user_metadata miliknya sendiri lewat API.
create or replace function public.is_admin()
returns boolean
language sql
stable
set search_path = ''
as $$
  select coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false);
$$;

-- ---------- 2) Booking publik: batas tanggal menurut WIB ----------
-- current_date memakai UTC; antara 00:00-07:00 WIB tanggal "kemarin WIB" masih lolos. Pakai Asia/Jakarta.
drop policy if exists "bookings_public_insert" on public.bookings;
create policy "bookings_public_insert" on public.bookings
  for insert to anon, authenticated
  with check (status = 'pending' and "date" >= (now() at time zone 'Asia/Jakarta')::date);

-- ---------- 3) Admin: tulis katalog & layanan ----------
-- (select ...) membungkus pemanggilan fungsi agar dievaluasi sekali per query, bukan per baris.
drop policy if exists "products_admin_write" on public.products;
create policy "products_admin_write" on public.products
  for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

drop policy if exists "services_admin_write" on public.services;
create policy "services_admin_write" on public.services
  for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- ---------- 4) Admin: kelola booking ----------
drop policy if exists "bookings_admin_all" on public.bookings;
create policy "bookings_admin_all" on public.bookings
  for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- ---------- 5) Hak akses tabel (tetap dilapisi RLS di atas) ----------
-- Pengguna "authenticated" biasa yang bukan admin tetap TIDAK bisa menulis/membaca bookings:
-- hak tabel ada, tetapi tidak ada policy yang cocok -> 0 baris.
-- anon TIDAK mendapat tambahan apa pun.
grant insert, update, delete on public.products, public.services to authenticated;
grant select, update, delete on public.bookings to authenticated;

commit;

-- ---------- OPSIONAL: tabel baru default-tertutup ----------
-- Supabase secara bawaan memberi anon/authenticated akses penuh ke tabel baru di schema public (dan baru aman
-- bila RLS diaktifkan). Buka komentar baris di bawah bila ingin tabel baru TIDAK otomatis terbuka ke API;
-- setelahnya setiap tabel baru perlu GRANT eksplisit. Berlaku untuk objek yang dibuat oleh role yang menjalankan perintah ini.
-- alter default privileges in schema public revoke all on tables from anon, authenticated;

-- ---------- CARA MENJADIKAN SESEORANG ADMIN ----------
-- 1) Buat pengguna di Dashboard -> Authentication -> Users.
-- 2) Beri role admin (jalankan sebagai postgres di SQL Editor):
--      update auth.users
--         set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role":"admin"}'::jsonb
--       where email = 'admin@contoh.com';
-- 3) Pengguna itu harus login ulang agar JWT barunya memuat role admin.
-- Catatan: aplikasi saat ini belum punya halaman login/admin; policy admin disiapkan untuk panel admin berikutnya.
