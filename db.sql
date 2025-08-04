create table public.mahasiswa (
  id uuid primary key default gen_random_uuid(),
  nama text not null,
  nim text unique not null,
  prodi text not null,
  hadir boolean default false,
  created_at timestamp with time zone default now()
);
create type tamu_tipe_enum as enum ('VIP', 'VVIP', 'Orang Tua');

create table public.tamu (
  id uuid primary key default gen_random_uuid(),
  nama text not null,
  tipe tamu_tipe_enum not null,
  instansi text,
  hadir boolean default false,
  created_at timestamp with time zone default now()
);

create index idx_mahasiswa_nim on public.mahasiswa (nim);
create index idx_tamu_nama on public.tamu (nama);

insert into public.mahasiswa (nama, nim, prodi)
values 
  ('Ahmad Rafi', '22040101', 'Teknik Informatika'),
  ('Dewi Lestari', '22040102', 'Sistem Informasi');
insert into public.tamu (nama, tipe, instansi)
values 
  ('Budi Hartono', 'VVIP', 'Kemendikbud'),
  ('Siti Aminah', 'Orang Tua', 'Orang Tua Mahasiswa');
