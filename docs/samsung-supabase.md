# Samsung Shop DE via Supabase (staged)

Samsung Awin merchant **14815**, data feed **33871**, publisher **3123004**. The uploaded CSV contains **1,453 unique Awin product IDs**. All records have been imported to the existing **findmydup-staging** Supabase project (EU Central), table `public.samsung_feed_products`. This is an import snapshot, not a live product/pricing API.

## Site integration

The new route `/samsung/` presents a **single searchable, paginated catalog**. Category choices are broad groups, not one page per product or raw Awin category. The global search `/suche/` optionally displays eight Samsung matches and links to the filtered catalog. The older 63 bdr-beauty product pages, Awin affiliate links, and live eBay Browse API remain unchanged.

The Samsung integration **fails closed and is disabled by default**. To enable on an authorized staging deployment, configure these *server-side* environment variables in Hostinger:

- `SAMSUNG_CATALOG_ENABLED=true`
- `SAMSUNG_SUPABASE_URL=https://<project-ref>.supabase.co`
- `SAMSUNG_SUPABASE_PUBLISHABLE_KEY=<public RLS-limited publishable key>`

Use the Supabase **publishable (public)** key, NEVER a service-role or secret key in the website read API. The table has RLS on and only grants SELECT to `anon` and `authenticated` for `published=true` products; no client write policy exists. The server uses a narrow column allowlist, bounded search, 24-item pagination, 8-second timeout and no-store responses.

**Do not set the staging Supabase project as the production database by accident.** Before making Samsung live, prepare or designate a production Supabase project, apply the same SQL migration and import an approved recent Samsung feed there; then set production env vars to that project. A new Supabase project can have a cost and needs separate approval. The existing Hostinger/MySQL features do not need to move.

## Feed safety and freshness

- Do not put the Awin feed-download API key or service-role key into GitHub, logs, client bundles, `NEXT_PUBLIC_*` or `llms.txt`.
- The original feed-download credential shared in conversation should be rotated and only stored in a private secret manager.
- Source `last_updated` is blank in all uploaded rows. Prices, stock and shipping are **feed snapshots**, not verified live offers. No sale or lowest-price promise.
- Upserts use `aw_product_id` as primary key. After future successful complete imports, outdated offers must be unpublished after an approved, atomic snapshot reconciliation (not blindly deleted).
- Awin `category_name` mislabels many products; use meaningful manually reviewed high-level categories. In particular, cases/covers, TV frames and smartwatch bands are accessories, not the devices.
- Affiliate `aw_deep_link` goes directly to the Samsung Shop through Awin. Source images must be on approved Samsung/FeedSpark hosts.

## Deployment validation

1. Keep `SAMSUNG_CATALOG_ENABLED` off during default CI and first merge.
2. Configure and verify the source Supabase project and RLS read-only access.
3. In staging, set the three env vars and verify `/samsung/`, filters, paging and `/suche/?q=Galaxy`.
4. Confirm eBay search, 63 Beauty products, Awin attribution, load time and existing smoke tests still work.
5. Only enable production after explicit project and credential selection. Use `npm run samsung:import -- /path/to/samsung.csv` for a **read-only dry run**. An authorized write requires `--confirm`, `SAMSUNG_FEED_IMPORT_ENABLED=true`, and server-only `SAMSUNG_SUPABASE_SERVICE_ROLE_KEY`; production additionally needs `SAMSUNG_IMPORT_PRODUCTION_ENABLED=true`. This importer never downloads a feed or publishes credentials. Scheduling periodic validated imports is future work; never perform imports in a user-facing request.
