-- CI-only test using a disposable local PostgreSQL instance.
-- NEVER run against the user's Supabase project: these are synthetic fixtures.
begin;
insert into public.catalog_offers (
 offer_id, product_id, title, description, category, retailer_id, retailer_name,
 amount_minor, observed_at, last_seen_at, availability, published
) values
 ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000011',
  'Published Tasche', '', 'mode', '00000000-0000-0000-0000-000000000021',
  'Test Shop', 1299, now(), now(), 'in_stock', true),
 ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000012',
  'Private Tasche', '', 'mode', '00000000-0000-0000-0000-000000000022',
  'Test Shop', 999, now(), now(), 'in_stock', false),
 ('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000013',
  'Out-of-stock Tasche', '', 'mode', '00000000-0000-0000-0000-000000000023',
  'Test Shop', 1999, now(), now(), 'out_of_stock', true);

do $check$
begin
  if has_table_privilege('anon','public.catalog_offers','INSERT') or
     has_table_privilege('anon','public.catalog_offers','UPDATE') or
     has_table_privilege('anon','public.catalog_offers','DELETE') then
    raise exception 'Anon must never have write privileges';
  end if;
  if not has_table_privilege('anon','public.catalog_offers','SELECT') then
    raise exception 'Anon SELECT missing';
  end if;
  if not (select relrowsecurity from pg_class where oid='public.catalog_offers'::regclass) then
    raise exception 'RLS disabled';
  end if;
end
$check$;

set local role anon;
do $check$
begin
  if (select count(*) from public.catalog_offers) <> 2 then
    raise exception 'RLS unpublished row was visible';
  end if;
  if (select count(*) from public.search_catalog('tasche')) <> 1 then
    raise exception 'Search must expose only published and available offers';
  end if;
  if (select count(*) from public.search_catalog('tasche', p_category => 'other')) <> 0 then
    raise exception 'Category filter failed';
  end if;
  if (select count(*) from public.search_catalog('tasche', p_max_price => 1000)) <> 0 then
    raise exception 'Price filter failed';
  end if;
  if (select count(*) from public.search_catalog('tasche', p_max_age_days => 0)) <> 0 then
    raise exception 'Freshness bound failed';
  end if;
  if (select count(*) from public.search_catalog('tasche%')) <> 0 then
    raise exception 'Percent sign must be escaped as literal search text';
  end if;
  if has_function_privilege('authenticated',
       'public.search_catalog(text,text,text,text,bigint,integer,integer,integer)', 'EXECUTE') then
    raise exception 'Authenticated RPC exposure is unexpected';
  end if;
end
$check$;
rollback;
