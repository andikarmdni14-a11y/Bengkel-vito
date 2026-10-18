-- =====================================================================
-- FitoMotor: bersihkan data DOBEL di products & services, lalu cegah terulang.
-- Penyebab umum: seed.sql dijalankan lebih dari sekali (versi lama tidak aman dijalankan ulang).
--
-- Jalankan SEKALI di Supabase Dashboard -> SQL Editor. Aman dijalankan ulang.
-- Aturan: untuk nama yang sama, baris yang paling awal dibuat dipertahankan, sisanya dihapus.
-- Booking yang sudah terlanjur menunjuk ke layanan dobel dialihkan ke layanan yang dipertahankan,
-- jadi tidak ada booking yang hilang.
-- Catatan: kalau Anda sudah mengedit salah satu baris dobel (mis. harga) lewat Table Editor,
-- periksa hasilnya setelah ini, karena baris yang dipertahankan ditentukan dari waktu dibuat.
-- =====================================================================

begin;

-- 1) services: alihkan booking dari baris dobel ke baris yang dipertahankan
with ranked as (
  select id,
         first_value(id) over w as keep_id,
         row_number()   over w as rn
  from public.services
  window w as (partition by name order by created_at, id)
)
update public.bookings b
set    service_id = r.keep_id
from   ranked r
where  b.service_id = r.id
  and  r.rn > 1;

-- 2) services: hapus baris dobel
delete from public.services
where id in (
  select id
  from (
    select id, row_number() over (partition by name order by created_at, id) as rn
    from public.services
  ) t
  where t.rn > 1
);

-- 3) products: hapus baris dobel
delete from public.products
where id in (
  select id
  from (
    select id, row_number() over (partition by name order by created_at, id) as rn
    from public.products
  ) t
  where t.rn > 1
);

-- 4) cegah dobel di masa depan (nama harus unik)
create unique index if not exists products_name_uidx on public.products (name);
create unique index if not exists services_name_uidx on public.services (name);

commit;

-- Hasil akhir: jumlah baris yang tersisa
select (select count(*) from public.services) as total_services,
       (select count(*) from public.products) as total_products;
