-- Applied separately to the existing findmydup-staging project.
-- For a future production Supabase project, review then apply via its SQL migration workflow.
-- Standalone Samsung catalog: never changes the existing MySQL/eBay/Awin Beauty tables.
create table if not exists public.samsung_feed_products (
  aw_product_id text primary key check (aw_product_id ~ '^[0-9]{1,20}$'),
  merchant_product_id text not null check (char_length(merchant_product_id) between 1 and 160),
  product_name text not null check (char_length(product_name) between 2 and 300),
  description text not null default '',
  category text not null check (category in ('Smartphones','Tablets','Smartwatches','Fernseher','Monitore','Audio','Speicher & SSD','Haushaltsgeräte','Zubehör','Sonstiges')),
  merchant_category text not null default '',
  price_cents integer not null check (price_cents between 0 and 100000000),
  delivery_cents integer check (delivery_cents between 0 and 10000000),
  image_url text not null check (image_url like 'https://%'),
  affiliate_url text not null check (affiliate_url like 'https://www.awin1.com/pclick.php?%'),
  merchant_name text not null default 'Samsung Shop DE' check (merchant_name = 'Samsung Shop DE'),
  merchant_id text not null default '14815' check (merchant_id = '14815'),
  feed_id text not null default '33871' check (feed_id = '33871'),
  currency text not null default 'EUR' check (currency = 'EUR'),
  feed_reported_updated_at timestamptz,
  imported_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  published boolean not null default false
);
create index if not exists samsung_feed_products_category_price_idx on public.samsung_feed_products(category,price_cents,aw_product_id) where published;
create index if not exists samsung_feed_products_name_search_idx on public.samsung_feed_products using gin(to_tsvector('german',product_name)) where published;
alter table public.samsung_feed_products enable row level security;
revoke all on public.samsung_feed_products from public,anon,authenticated;
grant select on public.samsung_feed_products to anon,authenticated;
create policy samsung_published_read on public.samsung_feed_products for select to anon,authenticated using (published = true);
