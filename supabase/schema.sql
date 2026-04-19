-- ============================================================
-- Nomad Pocket — Supabase Schema
-- Supabase 대시보드 > SQL Editor에 전체 붙여넣고 실행
-- ============================================================

-- UUID 확장 활성화
create extension if not exists "pgcrypto";

-- ─── 1. categories (대분류) ──────────────────────────────────
create table categories (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  type        text not null check (type in ('expense', 'income')),
  user_id     uuid,
  created_at  timestamptz not null default now()
);

-- ─── 2. subcategories (소분류) ──────────────────────────────
create table subcategories (
  id           uuid primary key default gen_random_uuid(),
  category_id  uuid not null references categories(id) on delete cascade,
  name         text not null,
  user_id      uuid,
  created_at   timestamptz not null default now()
);

-- ─── 3. payment_methods (지출방식) ──────────────────────────
create table payment_methods (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  color       text not null default '#004ea7',  -- hex 색상
  initial     text not null default '',          -- 썸네일 이니셜
  user_id     uuid,
  created_at  timestamptz not null default now()
);

-- ─── 4. regions (지역) ──────────────────────────────────────
create table regions (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  is_active   boolean not null default true,
  user_id     uuid,
  created_at  timestamptz not null default now()
);

-- ─── 5. tags (태그) ─────────────────────────────────────────
create table tags (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  is_active   boolean not null default true,
  user_id     uuid,
  created_at  timestamptz not null default now()
);

-- ─── 6. currencies (통화) ───────────────────────────────────
create table currencies (
  code        text primary key,   -- 'KRW', 'USD', 'JPY', ...
  name        text not null,
  symbol      text not null,
  is_active   boolean not null default false,
  updated_at  timestamptz not null default now()
);

-- 기본 통화 데이터 삽입
insert into currencies (code, name, symbol, is_active) values
  ('KRW', '대한민국 원', '₩', true),
  ('USD', '미국 달러',   '$', true),
  ('JPY', '일본 엔',     '¥', false),
  ('EUR', '유로',        '€', false),
  ('THB', '태국 밧',     '฿', false),
  ('SGD', '싱가포르 달러','S$', false),
  ('AUD', '호주 달러',   'A$', false),
  ('IDR', '인도네시아 루피아','Rp', false);

-- ─── 7. fixed_items (고정지출/고정수입) ─────────────────────
create table fixed_items (
  id                 uuid primary key default gen_random_uuid(),
  type               text not null check (type in ('expense', 'income')),
  category_id        uuid not null references categories(id),
  subcategory_id     uuid not null references subcategories(id),
  description        text not null,
  amount             numeric(15,2) not null,
  currency           text not null default 'KRW' references currencies(code),
  payment_method_id  uuid references payment_methods(id),
  day_of_month       int check (day_of_month between 1 and 31),
  is_active          boolean not null default true,
  user_id            uuid,
  created_at         timestamptz not null default now()
);

-- ─── 8. transactions (거래) ─────────────────────────────────
create table transactions (
  id                 uuid primary key default gen_random_uuid(),
  type               text not null check (type in ('expense', 'income')),
  date               date not null,
  category_id        uuid not null references categories(id),
  subcategory_id     uuid not null references subcategories(id),
  description        text not null,
  memo               text,
  amount             numeric(15,2) not null,   -- 원화 환산 금액
  currency           text not null default 'KRW' references currencies(code),
  original_amount    numeric(15,4),             -- 외화 원본 금액
  exchange_rate      numeric(15,6),             -- 적용 환율
  payment_method_id  uuid references payment_methods(id),
  region_id          uuid references regions(id),
  tag_ids            uuid[] not null default '{}',
  is_fixed           boolean not null default false,
  fixed_item_id      uuid references fixed_items(id),
  user_id            uuid,
  created_at         timestamptz not null default now()
);

-- ─── 9. budgets (예산 목표) ──────────────────────────────────
create table budgets (
  id             uuid primary key default gen_random_uuid(),
  name           text not null,
  target_amount  numeric(15,2) not null,
  period_type    text not null check (period_type in ('yearly', 'monthly', 'custom')),
  year           int,
  month          int check (month between 1 and 12),
  start_date     date,
  end_date       date,
  filter_type    text not null default 'total'
                   check (filter_type in ('total', 'category', 'subcategory', 'region', 'tag')),
  filter_id      uuid,
  is_system      boolean not null default false,
  is_active      boolean not null default true,
  user_id        uuid,
  created_at     timestamptz not null default now()
);

-- ─── 10. profiles (사용자) ───────────────────────────────────
create table profiles (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  pin_hash    text,
  color       text,
  created_at  timestamptz not null default now()
);

-- ─── 인덱스 ──────────────────────────────────────────────────
create index on transactions (date desc);
create index on transactions (type);
create index on transactions (category_id);
create index on transactions (payment_method_id);
create index on transactions (region_id);
create index on transactions (user_id);
create index on subcategories (category_id);
create index on fixed_items (type, is_active);
create index on budgets (user_id);

-- ─── RLS (Row Level Security) ────────────────────────────────
-- MVP 단계: 인증 없이 전체 접근 허용 (추후 auth 추가 시 정책 수정)
alter table categories       enable row level security;
alter table subcategories    enable row level security;
alter table payment_methods  enable row level security;
alter table regions          enable row level security;
alter table tags             enable row level security;
alter table currencies       enable row level security;
alter table fixed_items      enable row level security;
alter table transactions     enable row level security;
alter table budgets          enable row level security;
alter table profiles         enable row level security;

create policy "public_all" on categories       for all using (true) with check (true);
create policy "public_all" on subcategories    for all using (true) with check (true);
create policy "public_all" on payment_methods  for all using (true) with check (true);
create policy "public_all" on regions          for all using (true) with check (true);
create policy "public_all" on tags             for all using (true) with check (true);
create policy "public_all" on currencies       for all using (true) with check (true);
create policy "public_all" on fixed_items      for all using (true) with check (true);
create policy "public_all" on transactions     for all using (true) with check (true);
create policy "public_all" on budgets          for all using (true) with check (true);
create policy "public_all" on profiles         for all using (true) with check (true);
