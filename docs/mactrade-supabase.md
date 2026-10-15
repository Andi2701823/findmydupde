# MacTrade Awin feed for FindMyDup, staging only

Source supplied 2026-10-15: Awin merchant 13737, feed 36137, publisher 3123004.
This is MacTrade, NOT the official Apple Online Store. The uploaded feed has 3,817 unique product IDs.

## Preparation and screening

- 3,794 valid positive-price products are kept; 23 zero-price voucher, reference, and shipping rows excluded.
- All kept rows have unique Awin IDs, EUR prices, a www.mactrade.de/media/ image and an Awin pclick affiliate URL pointing to merchant 13737 and publisher 3123004.
- HTML entities in names are decoded; long descriptions are trimmed to 650 characters.
- Categories are derived from the merchant category path (MacBooks, Desktop-Macs, iPhones, iPads, Apple Watch, Audio, Zubehör, Apple TV, Restposten).
- The feed labels all products in stock, but some specify delivery delays of weeks. Do not promise instant delivery.
- Some feed descriptions conflict with specific configured product titles. The website does not present the description as a verified specification.
- Merchant images remain remotely hosted; only their URLs are stored in Supabase.
- No feed auto-refresh has been set up yet.

## Database and safety

Staging project: findmydup-staging, ID bqefygvwuwqjoqkkftiv.
Separate table: public.mactrade_feed_products. The migration 20261015_mactrade_feed_catalog.sql has been applied to staging.
RLS protects the table. Anonymous and authenticated roles can SELECT published and in-stock rows, never write.

## Import status and repeatable verification

Import completed on 2026-10-15 directly into findmydup-staging. Database verification: **3,794 rows, 3,794 unique IDs, 3,794 published and in stock**, zero missing names/links, zero invalid prices, zero wrong-feed rows. The original 23 zero-price records are excluded. The source CSV must NOT be imported again unless a controlled upsert/reconciliation is planned.

## For a future manual CSV import

1. Download MacTrade_Supabase_Import_3794.csv from ChatGPT when explicitly doing a fresh import. Do not commit the private feed or processed CSV to GitHub.
2. For a fresh empty environment only: Supabase Dashboard > findmydup-staging > Table Editor > mactrade_feed_products > Import data from CSV.
3. Import all 3,794 rows. Do not clear, merge into or edit JoyBuy/Samsung tables.
4. Check in SQL Editor:

SELECT count(*) AS imported,
       count(DISTINCT aw_product_id) AS unique_ids,
       count(*) FILTER (WHERE published AND in_stock) AS visible,
       count(*) FILTER (WHERE price_cents <= 0) AS invalid_prices,
       count(*) FILTER (WHERE image_url IS NULL OR affiliate_url IS NULL) AS invalid_links
FROM public.mactrade_feed_products;

Expected: imported=3794, unique_ids=3794, visible=3794, invalid_prices=0, invalid_links=0.

## Safe activation

1. Deploy the feature branch to a staging Node.js app and verify its build first.
2. Only after successful DB import/verification set MACTRADE_CATALOG_ENABLED=true in the staging server environment.
3. Restart staging. Check /mactrade/, /api/mactrade/search/?q=MacBook and /suche/?q=MacBook&source=mactrade.
4. Recheck existing Samsung, JoyBuy, eBay and Beauty searches.
5. Do not enable production before separate approval and testing. Default flag remains OFF, and creating a PR does not deploy code.

The server uses SUPABASE_URL / SUPABASE_PUBLISHABLE_KEY or the existing SAMSUNG_SUPABASE equivalents.
Do not expose service-role keys or unlisted feed secrets to the client. For later imports use validated keyed upserts and stale-row reconciliation.
