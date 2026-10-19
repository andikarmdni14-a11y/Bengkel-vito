-- =====================================================================
-- FitoMotor (OPSIONAL): batasi booking per nomor telepon di level database.
-- RLS mengizinkan pengunjung anonim meng-INSERT booking; tanpa pembatas, skrip bisa membanjiri tabel.
-- Trigger ini menolak INSERT bila nomor yang sama sudah membuat >= 5 booking dalam 24 jam terakhir.
--
-- KETERBATASAN: penyerang bisa mengganti-ganti nomor. Untuk perlindungan nyata tambahkan CAPTCHA
-- (mis. Cloudflare Turnstile) + Edge Function / rate limit di sisi server. Ini hanya lapisan dasar.
-- Frontend sudah menampilkan pesan trigger ini apa adanya (src/lib/dbErrors.ts).
-- Aman dijalankan ulang. Jalankan verify_rls.sql sesudahnya untuk memastikan booking normal masih bisa.
-- =====================================================================

create or replace function public.limit_bookings_per_phone()
returns trigger
language plpgsql
security definer          -- perlu membaca bookings walau pemanggil (anon) tidak punya hak SELECT
set search_path = ''
as $$
declare
  recent integer;
begin
  select count(*) into recent
  from public.bookings b
  where regexp_replace(b.phone, '\D', '', 'g') = regexp_replace(new.phone, '\D', '', 'g')
    and b.created_at > now() - interval '24 hours';

  if recent >= 5 then
    raise exception 'Terlalu banyak booking dari nomor ini dalam 24 jam. Silakan hubungi kami lewat WhatsApp.'
      using errcode = 'P0001';
  end if;
  return new;
end;
$$;

revoke all on function public.limit_bookings_per_phone() from public, anon, authenticated;

drop trigger if exists bookings_rate_limit on public.bookings;
create trigger bookings_rate_limit
  before insert on public.bookings
  for each row execute function public.limit_bookings_per_phone();

-- Untuk mencabut: drop trigger bookings_rate_limit on public.bookings;
