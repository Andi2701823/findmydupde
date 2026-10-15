# Samsung Shop DE via Supabase (shared with live website)

Samsung Awin merchant **14815**, data feed **33871**, publisher **3123004**. The uploaded CSV contains **1,453 unique Awin product IDs**. All records have been imported to the existing **findmydup-staging** Supabase project (EU Central), table `public.samsung_feed_products`. This is an import snapshot, not a live product/pricing API.

## Site integration

The new route `/samsung/` presents a **single searchable, paginated catalog**. Category choices are broad groups, not one page per product or raw Awin category. The global search `/suche/` optionally displays eight Samsung matches and links to the filtered catalog. The older 63 bdr-beauty product pages, Awin affiliate links, and live eBay Browse API remain unchanged.

The site owner explicitly approved using the already-existing `findmydup-staging` Supabase project for **the live website** on 2026-10-15, to avoid a second project. This is a shared data environment: imports or changes to this project will affect live Samsung offers once enabled. **Do not run destructive experiments here.** The Samsung integration remains **disabled by default** until these *server-side* runtime variables are set in the Hostinger Node.js deployment:

- `SAMSUNG_CATALOG_ENABLED=true`
- `SAMSUNG_SUPABASE_URL=https://bqefygvwuwqjoqkkftiv.supabase.co`
- `SAMSUNG_SUPABASE_PUBLISHABLE_KEY=<public RLS-limited publishable key>`

Use the Supabase **publishable (public)** key, NEVER a service-role or secret key in the website read API. The table has RLS on and only grants SELECT to `anon` and `authenticated` for `published=true` products; no client write policy exists. The server uses a narrow column allowlist, bounded search, 24-item pagination, 8-second timeout and no-store responses.

**Production source approved:** the same existing `findmydup-staging` project is intentionally used for live Samsung offers. This Supabase project remains separate from Hostinger's MySQL and existing eBay integrations. The shared-use decision trades away test/production data isolation to avoid an extra project; use temporary local/CI fixtures for tests, not destructive changes in the shared database. No new Supabase project or associated project fees are required.

## Feed safety and freshness

- Do not put the Awin feed-download API key or service-role key into GitHub, logs, client bundles, `NEXT_PUBLIC_*` or `llms.txt`.
- The original feed-download credential shared in conversation should be rotated and only stored in a private secret manager.
- Source `last_updated` is blank in all uploaded rows. Prices, stock and shipping are **feed snapshots**, not verified live offers. No sale or lowest-price promise.
- Upserts use `aw_product_id` as primary key. After future successful complete imports, outdated offers must be unpublished after an approved, atomic snapshot reconciliation (not blindly deleted).
- Awin `category_name` mislabels many products; use meaningful manually reviewed high-level categories. In particular, cases/covers, TV frames and smartwatch bands are accessories, not the devices.
- Affiliate `aw_deep_link` goes directly to the Samsung Shop through Awin. Source images must be on approved Samsung/FeedSpark hosts.

## Deployment validation

1. Keep `SAMSUNG_CATALOG_ENABLED` off during default CI. Standalone Hostinger server must compile both `/samsung/` and `/api/samsung/search/` routes; tests assert both.
2. Verify the existing shared Supabase project's RLS read-only access; do not expose the service role key.
3. Set the three server-side Hostinger env vars above, use the project's **publishable** key from Supabase Settings → API Keys (not an Awin download key), and redeploy/restart the Node app.
4. Verify `/samsung/`, category filters, pagination, and `/suche/?q=Galaxy` on the actual live site; then check eBay search, 63 Beauty products, Awin attribution, load time and existing smoke tests. Do not claim live readiness before this step.
5. For ongoing imports, use `npm run samsung:import -- /path/to/samsung.csv` for a **read-only dry run**. An authorized write requires `--confirm`, `SAMSUNG_FEED_IMPORT_ENABLED=true`, and server-only `SAMSUNG_SUPABASE_SERVICE_ROLE_KEY`; production additionally needs `SAMSUNG_IMPORT_PRODUCTION_ENABLED=true`. This importer never downloads a feed or publishes credentials. Scheduling periodic validated imports is future work; never perform imports in a user-facing request.
