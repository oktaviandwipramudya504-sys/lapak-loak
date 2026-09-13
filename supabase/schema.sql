-- Skema database Lapak Loak (Supabase / Postgres)
-- Jalankan di Supabase SQL Editor.

create table items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  condition_notes text,
  starting_price numeric not null,
  photos text[] default '{}',
  video_url text,
  tags text[] default '{}',
  status text not null default 'tersedia'
    check (status in ('tersedia','ditawar','deal','diamankan','terjual')),
  created_at timestamptz default now()
);

create table negotiations (
  id uuid primary key default gen_random_uuid(),
  item_id uuid references items(id) on delete cascade,
  buyer_whatsapp text not null,
  status text not null default 'aktif'
    check (status in ('aktif','menang','kalah','batal')),
  created_at timestamptz default now()
);

create table offers (
  id uuid primary key default gen_random_uuid(),
  negotiation_id uuid references negotiations(id) on delete cascade,
  sender text not null check (sender in ('buyer','admin')),
  amount numeric not null,
  message text,
  created_at timestamptz default now()
);

create table orders (
  order_code text primary key,
  item_id uuid references items(id),
  negotiation_id uuid references negotiations(id),
  buyer_name text,
  buyer_whatsapp text not null,
  address text,
  final_price numeric,
  shipping_cost numeric default 0,
  payment_proof_url text,
  tracking_number text,
  status text not null default 'dibuat'
    check (status in ('dibuat','menunggu-verifikasi','diverifikasi','dikemas','dikirim','selesai')),
  created_at timestamptz default now(),
  completed_at timestamptz,
  -- Waktu media (foto/video/bukti transfer) dijadwalkan untuk dihapus.
  -- Diisi otomatis lewat trigger di bawah, 7-14 hari setelah status = selesai.
  media_purge_at timestamptz
);

create table buyer_stories (
  id uuid primary key default gen_random_uuid(),
  order_code text references orders(order_code),
  rating int check (rating between 1 and 5),
  comment text,
  created_at timestamptz default now()
);

create table recommendations (
  id uuid primary key default gen_random_uuid(),
  type text not null,
  name text not null,
  description text,
  image text
);

create table settings (
  key text primary key,
  value text
);

-- admin_users: pakai Supabase Auth bawaan (auth.users), tabel ini
-- cuma kalau butuh data tambahan per admin (nama tampilan, dll).
create table admin_profiles (
  id uuid primary key references auth.users(id),
  display_name text
);

-- Trigger: begitu order jadi "selesai", jadwalkan penghapusan media 10 hari lagi.
create or replace function set_media_purge_at()
returns trigger as $$
begin
  if new.status = 'selesai' and old.status is distinct from 'selesai' then
    new.completed_at := now();
    new.media_purge_at := now() + interval '10 days';
  end if;
  return new;
end;
$$ language plpgsql;

create trigger trg_set_media_purge_at
before update on orders
for each row execute function set_media_purge_at();

-- Catatan: penghapusan file aktual (foto/video di Storage) perlu dijalankan
-- lewat cron job terpisah (misal Supabase Edge Function terjadwal) yang
-- query WHERE media_purge_at <= now() lalu hapus file dari Storage.
