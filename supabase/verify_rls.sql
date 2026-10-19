-- =====================================================================
-- FitoMotor: verifikasi RLS. Jalankan di SQL Editor SETELAH schema.sql, seed.sql, rls_hardening.sql.
-- Bagian C melempar galat bila ada aturan yang bocor. Bila bagian C selesai tanpa galat, baris terakhir tampil.
-- Aman dijalankan ulang; data uji dihapus sendiri.
-- =====================================================================

-- A. RLS harus aktif (rls_aktif = true) di ketiga tabel
select c.relname as tabel, c.relrowsecurity as rls_aktif
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relname in ('products', 'services', 'bookings')
order by c.relname;

-- B. Hak akses tabel untuk anon: hanya baris yang berstatus "sesuai = true" yang aman
select t.tabel, t.hak,
       has_table_privilege('anon', 'public.' || t.tabel, t.hak) as dimiliki_anon,
       t.seharusnya,
       has_table_privilege('anon', 'public.' || t.tabel, t.hak) = t.seharusnya as sesuai
from (values
  ('products', 'SELECT', true),  ('products', 'INSERT', false), ('products', 'UPDATE', false), ('products', 'DELETE', false),
  ('services', 'SELECT', true),  ('services', 'INSERT', false), ('services', 'UPDATE', false), ('services', 'DELETE', false),
  ('bookings', 'SELECT', false), ('bookings', 'INSERT', true),  ('bookings', 'UPDATE', false), ('bookings', 'DELETE', false)
) as t(tabel, hak, seharusnya)
order by t.tabel, t.hak;

-- Daftar policy yang berlaku
select tablename, policyname, cmd, roles
from pg_policies
where schemaname = 'public'
order by tablename, policyname;

-- C. Uji fungsional sebagai anon (mengganti role sementara; berakhir dengan reset role)
do $$
declare
  svc uuid;
  ok_read_products     boolean := false;
  ok_read_services     boolean := false;
  ok_insert_valid      boolean := false;
  blocked_confirmed    boolean := false;
  blocked_past_date    boolean := false;
  blocked_select_book  boolean := false;
  blocked_update_book  boolean := false;
  blocked_delete_book  boolean := false;
  blocked_write_prod   boolean := false;
  blocked_write_serv   boolean := false;
  gagal text := '';
begin
  select id into svc from public.services limit 1;
  if svc is null then
    raise exception 'Tabel services kosong: jalankan seed.sql dulu.';
  end if;

  set local role anon;

  begin perform 1 from public.products limit 1; ok_read_products := true; exception when others then null; end;
  begin perform 1 from public.services limit 1; ok_read_services := true; exception when others then null; end;

  begin
    insert into public.bookings (user_name, phone, service_id, motor, "date", "time")
    values ('TES RLS valid', '081234567890', svc, 'Motor Uji', current_date + 1, '09:00');
    ok_insert_valid := true;
  exception when others then null; end;

  begin
    insert into public.bookings (user_name, phone, service_id, motor, "date", "time", status)
    values ('TES RLS confirmed', '081234567890', svc, 'Motor Uji', current_date + 1, '09:00', 'confirmed');
  exception when insufficient_privilege then blocked_confirmed := true; end;

  begin
    insert into public.bookings (user_name, phone, service_id, motor, "date", "time")
    values ('TES RLS lampau', '081234567890', svc, 'Motor Uji', current_date - 30, '09:00');
  exception when insufficient_privilege then blocked_past_date := true; end;

  begin
    perform 1 from public.bookings limit 1;
    if not found then blocked_select_book := true; end if;
  exception when insufficient_privilege then blocked_select_book := true; end;

  begin
    update public.bookings set status = 'cancelled' where user_name like 'TES RLS%';
    if not found then blocked_update_book := true; end if;
  exception when insufficient_privilege then blocked_update_book := true; end;

  begin
    delete from public.bookings where user_name like 'TES RLS%';
    if not found then blocked_delete_book := true; end if;
  exception when insufficient_privilege then blocked_delete_book := true; end;

  begin
    insert into public.products (name, category, price) values ('TES RLS WRITE', 'x', 1);
  exception when insufficient_privilege then blocked_write_prod := true; end;

  begin
    insert into public.services (name, price, duration) values ('TES RLS WRITE', 1, 1);
  exception when insufficient_privilege then blocked_write_serv := true; end;

  reset role;

  -- bersihkan sisa data uji (sebagai postgres)
  delete from public.bookings where user_name like 'TES RLS%';
  delete from public.products where name = 'TES RLS WRITE';
  delete from public.services where name = 'TES RLS WRITE';

  if not ok_read_products    then gagal := gagal || E'\n- anon TIDAK bisa membaca products'; end if;
  if not ok_read_services    then gagal := gagal || E'\n- anon TIDAK bisa membaca services'; end if;
  if not ok_insert_valid     then gagal := gagal || E'\n- anon TIDAK bisa INSERT booking valid'; end if;
  if not blocked_confirmed   then gagal := gagal || E'\n- anon bisa membuat booking berstatus selain pending'; end if;
  if not blocked_past_date   then gagal := gagal || E'\n- anon bisa membuat booking bertanggal lampau'; end if;
  if not blocked_select_book then gagal := gagal || E'\n- anon BISA MEMBACA bookings (nomor telepon bocor)'; end if;
  if not blocked_update_book then gagal := gagal || E'\n- anon bisa UPDATE bookings'; end if;
  if not blocked_delete_book then gagal := gagal || E'\n- anon bisa DELETE bookings'; end if;
  if not blocked_write_prod  then gagal := gagal || E'\n- anon bisa menulis ke products'; end if;
  if not blocked_write_serv  then gagal := gagal || E'\n- anon bisa menulis ke services'; end if;

  if gagal <> '' then
    raise exception 'RLS BELUM AMAN:%', gagal;
  end if;
end
$$;

select 'LULUS: bagian C selesai tanpa galat, semua aturan RLS untuk anon sesuai harapan.' as hasil;
