-- =====================================================================
-- FitoMotor: data awal. Semua nilai ini DATA DUMMY, ganti dengan data asli bengkel
-- (lewat Table Editor di Dashboard, atau edit file ini lalu jalankan ulang pada tabel kosong).
-- Jalankan SETELAH schema.sql.
-- Aman dijalankan berulang: baris dengan nama yang sudah ada dilewati (tidak dobel, tidak menimpa hasil edit Anda).
-- =====================================================================

insert into public.products (name, category, price, description, image_url, stock, sort_order) values
  ('Ban Tubeless Ring 14 80/90',  'Ban Motor',   285000, 'Ban tubeless ring 14 ukuran 80/90 untuk motor matic.',        'https://placehold.co/600x600/f1f5f9/94a3b8?text=Ban+Tubeless',   12, 1),
  ('Ban Racing Ring 17 120/70',   'Ban Motor',   485000, 'Ban ring 17 ukuran 120/70 dengan cengkeraman tinggi.',        'https://placehold.co/600x600/f1f5f9/94a3b8?text=Ban+Racing',      5, 2),
  ('Helm Full Face Matte Black',  'Aksesoris',   650000, 'Helm full face warna hitam doff, visor anti gores.',          'https://placehold.co/600x600/f1f5f9/94a3b8?text=Helm+Full+Face',  3, 3),
  ('Sarung Tangan Touring',       'Aksesoris',   175000, 'Sarung tangan touring dengan pelindung buku jari.',           'https://placehold.co/600x600/f1f5f9/94a3b8?text=Sarung+Tangan',  20, 4),
  ('Kampas Rem Depan',            'Suku Cadang',  95000, 'Kampas rem depan, cocok untuk berbagai motor matic.',         'https://placehold.co/600x600/f1f5f9/94a3b8?text=Kampas+Rem',     15, 5),
  ('Oli Mesin 10W-40 1 Liter',    'Suku Cadang',  78000, 'Oli mesin 10W-40 kemasan 1 liter.',                           'https://placehold.co/600x600/f1f5f9/94a3b8?text=Oli+Mesin',      30, 6),
  ('Busi Iridium',                'Suku Cadang', 135000, 'Busi iridium untuk pengapian lebih stabil.',                  'https://placehold.co/600x600/f1f5f9/94a3b8?text=Busi+Iridium',    0, 7),
  ('Spion Racing CNC (Sepasang)', 'Aksesoris',   120000, 'Spion racing bahan CNC, dijual sepasang.',                    'https://placehold.co/600x600/f1f5f9/94a3b8?text=Spion+Racing',    8, 8)
on conflict (name) do nothing;

-- Catatan: price & duration pada services adalah placeholder (belum ada di data awal proyek). Ganti dengan tarif asli.
insert into public.services (name, price, duration, description, icon, details, sort_order) values
  ('Servis & Perawatan', 50000, 60,
   'Servis rutin, tune-up, ganti oli, hingga overhaul mesin dikerjakan mekanik berpengalaman.',
   'wrench',
   array['Servis rutin & tune-up', 'Ganti oli', 'Overhaul mesin', 'Dikerjakan mekanik berpengalaman'], 1),
  ('Tambal Ban & Angin', 15000, 20,
   'Tambal ban tubeless dan non-tubeless, isi angin nitrogen. Cepat, selesai di tempat.',
   'circle-gauge',
   array['Tambal ban tubeless', 'Tambal ban non-tubeless', 'Isi angin nitrogen', 'Cepat, selesai di tempat'], 2),
  ('Ganti Suku Cadang', 25000, 45,
   'Suku cadang original dan aftermarket pilihan, dipasang langsung dengan garansi pemasangan.',
   'cog',
   array['Suku cadang original', 'Aftermarket pilihan', 'Dipasang langsung', 'Garansi pemasangan'], 3)
on conflict (name) do nothing;
