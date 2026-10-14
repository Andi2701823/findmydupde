-- FindMyDup Supabase staging-only read catalog, PostgreSQL 15+.
-- Apply in a dedicated NEW Supabase project via SQL Editor, after review.
-- No sample offers, admin tokens, production data or write jobs included.
-- This is a deliberately public-safe, flattened *published* offer projection.
-- Later Awin imports will be an isolated, separately authorized maintenance job.

begin;

create table if not exists public.catalog_offers (
  offer_id uuid primary key,
  product_id uuid not null,
  title text not null check (char_length(title) between 2 and 300),
  description text not null default '',
  category text not null check (char_length(category) between 1 and 64),
  color text,
  material text,
  retailer_id uuid not null,
  retailer_name text not null check (char_length(retailer_name) between 1 and 160),
  image_url text,
  amount_minor bigint not null check (amount_minor between 0 and 1000000000),
  currency text not null default 'EUR' check (currency = 'EUR'),
  observed_at timestamptz not null,
  availability text not null default 'unknown'
    check (availability in ('in_stock', 'out_of_stock', 'unknown')),
  affiliate_url text,
  last_seen_at timestamptz not null,
  published boolean not null default false
);

create index if not exists catalog_offers_recent_idx
  on public.catalog_offers (last_seen_at desc, observed_at desc)
  where published = true;
create index if not exists catalog_offers_category_price_idx
  on public.catalog_offers (category, amount_minor)
  where published = true;

-- Supabase may grant broad public-schema access by default: remove it.
revoke all privileges on table public.catalog_offers from public, anon, authenticated;
alter table public.catalog_offers enable row level security;
drop policy if exists catalog_offers_published_anon on public.catalog_offers;
create policy catalog_offers_published_anon on public.catalog_offers
  for select to anon using (published = true);

-- This one table contains only product fields intended for public display.
-- RLS additionally hides unpublished records from the publishable-key role.
grant select on table public.catalog_offers to anon;

create or replace function public.search_catalog(
  p_q text,
  p_sort text default 'recent',
  p_category text default null,
  p_color text default null,
  p_max_price bigint default null,
  p_limit integer default 13,
  p_offset integer default 0,
  p_max_age_days integer default 3
)
returns table (
  product_id uuid,
  offer_id uuid,
  title text,
  description text,
  category text,
  color text,
  material text,
  retailer_id uuid,
  retailer_name text,
  image_url text,
  amount_minor bigint,
  currency text,
  observed_at text,
  availability text,
  affiliate_url text
)
language sql
stable
security invoker
set search_path = ''
as $$
  select c.product_id, c.offer_id, c.title, c.description, c.category,
    c.color, c.material, c.retailer_id, c.retailer_name, c.image_url,
    c.amount_minor, c.currency,
    to_char(c.observed_at at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
    c.availability, c.affiliate_url
  from public.catalog_offers c
  where c.published = true
    and c.availability <> 'out_of_stock'
    and c.currency = 'EUR'
    and c.last_seen_at >= now() - make_interval(days => p_max_age_days)
    and p_q is not null
    and char_length(p_q) between 2 and 120
    and array_length(regexp_split_to_array(btrim(p_q), '[[:space:]]+'), 1)
        between 1 and 6
    and p_sort in ('price-asc', 'price-desc', 'recent')
    and p_limit between 1 and 25
    and p_offset between 0 and 1200
    and p_max_age_days between 1 and 30
    and (p_category is null or c.category = p_category)
    and (p_color is null or c.color = p_color)
    and (p_max_price is null or (p_max_price between 0 and 1000000000
         and c.amount_minor <= p_max_price))
    and not exists (
      select 1
      from unnest(regexp_split_to_array(btrim(p_q), '[[:space:]]+')) as t(token)
      where c.title not ilike
        '%' || replace(replace(replace(t.token, '!', '!!'), '%', '!%'), '_', '!_') || '%'
        escape '!'
    )
  order by
    case when p_sort = 'price-asc' then c.amount_minor end asc nulls last,
    case when p_sort = 'price-desc' then c.amount_minor end desc nulls last,
    case when p_sort = 'recent' then c.observed_at end desc nulls last,
    c.offer_id asc
  limit p_limit offset p_offset;
$$;

-- SQL functions are executable by PUBLIC by default: explicitly narrow this.
revoke all on function public.search_catalog(text,text,text,text,bigint,integer,integer,integer)
  from public, anon, authenticated;
grant execute on function public.search_catalog(text,text,text,text,bigint,integer,integer,integer)
  to anon;

commit;

-- Safe manual verification in SQL Editor:
-- select has_table_privilege('anon', 'public.catalog_offers', 'INSERT');
-- select has_table_privilege('anon', 'public.catalog_offers', 'UPDATE');
-- select has_table_privilege('anon', 'public.catalog_offers', 'DELETE');
-- All three must be false.
-- select * from public.search_catalog('tasche'); -- expected 0 rows until real feeds exist.
