-- =========================================================================
-- WARUNG RASA NUSANTARA - SUPABASE DATABASE SCHEMA DESIGN
-- =========================================================================

-- Hapus tabel jika sudah ada (Opsional untuk Reset)
drop table if exists orders;
drop table if exists tables;
drop table if exists menu;

-- 1. TABEL: menu
create table menu (
  id bigint primary key generated always as identity,
  name text not null,
  category text not null,
  price double precision not null,
  "desc" text,
  emoji text default '🍛',
  available boolean default true,
  popular boolean default false,
  created_at timestamptz default now()
);

-- 2. TABEL: tables
create table tables (
  id bigint primary key generated always as identity,
  name text not null,
  status text default 'kosong' check (status in ('kosong', 'terisi')),
  created_at timestamptz default now()
);

-- 3. TABEL: orders
create table orders (
  id bigint primary key generated always as identity,
  code text not null,
  table_id bigint not null,
  items jsonb not null, -- Menyimpan rincian list makanan dan quantity
  status text default 'masuk' check (status in ('masuk', 'diproses', 'selesai')),
  total double precision not null,
  created_at timestamptz default now()
);

-- Menambahkan indeks untuk performa pencarian pesanan
create index idx_orders_created_at on orders(created_at desc);

-- =========================================================================
-- DATA SEEDING (DATA AWAL)
-- =========================================================================

-- Seed Menu Makanan Awal
insert into menu (name, category, price, "desc", emoji, available, popular) values
('Nasi Goreng Spesial', 'Makanan Utama', 32000, 'Nasi goreng telur, ayam suwir, kerupuk', '🍛', true, true),
('Ayam Geprek Sambal Korek', 'Makanan Utama', 28000, 'Ayam crispy, sambal korek pedas', '🍗', true, true),
('Sate Ayam Madura', 'Makanan Utama', 30000, '10 tusuk, bumbu kacang, lontong', '🍢', true, false),
('Mie Goreng Jawa', 'Makanan Utama', 26000, 'Mie goreng bumbu jawa, telur ceplok', '🍜', true, false),
('Tahu Tempe Mendoan', 'Camilan', 15000, '6 potong, sambal kecap', '🧈', true, false),
('Pisang Goreng Keju', 'Camilan', 18000, 'Pisang goreng crispy, keju, cokelat', '🍌', true, true),
('Kentang Goreng', 'Camilan', 16000, 'Kentang goreng saus sambal mayo', '🍟', true, false),
('Es Teh Manis', 'Minuman', 8000, 'Teh manis dingin segar', '🧊', true, true),
('Es Jeruk Peras', 'Minuman', 10000, 'Es jeruk manis perasan segar asli', '🍊', true, false),
('Kopi Susu Gula Aren', 'Minuman', 18000, 'Kopi susu espresso gula aren dan es batu', '☕', true, true),
('Es Cendol', 'Dessert', 14000, 'Cendol kenyal, santan kelapa, gula merah cair', '🍧', true, false),
('Puding Cokelat', 'Dessert', 12000, 'Puding cokelat lembut dengan vla vanila', '🍮', true, false);

-- Seed Daftar Meja Makan Awal (1-12)
insert into tables (name, status) values
('Meja 01', 'kosong'),
('Meja 02', 'kosong'),
('Meja 03', 'kosong'),
('Meja 04', 'kosong'),
('Meja 05', 'kosong'),
('Meja 06', 'kosong'),
('Meja 07', 'kosong'),
('Meja 08', 'kosong'),
('Meja 09', 'kosong'),
('Meja 10', 'kosong'),
('Meja 11', 'kosong'),
('Meja 12', 'kosong');

-- Seed Pesanan Awal (Contoh Pesanan Lama)
insert into orders (code, table_id, items, status, total, created_at) values
('A01', 3, '[{"id": 1, "name": "Nasi Goreng Spesial", "price": 32000, "qty": 2}, {"id": 8, "name": "Es Teh Manis", "price": 8000, "qty": 2}]'::jsonb, 'selesai', 80000, now() - interval '3 hours'),
('A02', 5, '[{"id": 2, "name": "Ayam Geprek Sambal Korek", "price": 28000, "qty": 1}, {"id": 10, "name": "Kopi Susu Gula Aren", "price": 18000, "qty": 1}]'::jsonb, 'selesai', 46000, now() - interval '2.5 hours'),
('A03', 2, '[{"id": 4, "name": "Mie Goreng Jawa", "price": 26000, "qty": 1}, {"id": 6, "name": "Pisang Goreng Keju", "price": 18000, "qty": 1}]'::jsonb, 'diproses', 44000, now() - interval '1 hour'),
('A04', 7, '[{"id": 3, "name": "Sate Ayam Madura", "price": 30000, "qty": 2}, {"id": 9, "name": "Es Jeruk Peras", "price": 10000, "qty": 3}]'::jsonb, 'selesai', 90000, now() - interval '40 minutes'),
('A05', 1, '[{"id": 7, "name": "Kentang Goreng", "price": 16000, "qty": 1}, {"id": 11, "name": "Es Cendol", "price": 14000, "qty": 1}]'::jsonb, 'masuk', 30000, now() - interval '15 minutes');
