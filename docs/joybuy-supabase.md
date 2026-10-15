# JoyBuy DE: private CSV feed import

Feed uploaded on 2026-10-15: `123926-retail-de_DE.csv`, 80.6 MiB, 36,809 unique IDs, Awin advertiser 123926, publisher 3123004.

## Database preparation

Already created table `public.joybuy_feed_products` in existing shared live Supabase project `bqefygvwuwqjoqkkftiv`.
RLS permits public SELECT only on `published = true AND in_stock = true`; the public key cannot insert/update/delete.

## Private four-part CSV import

Download the `JoyBuy_Supabase_Import_36809.zip` attachment **from the conversation**, not GitHub.
The private archive contains four CSV files, up to 9,500 rows per file, with columns matching the table. 
In Supabase Dashboard -> project findmydup-staging -> Table Editor -> joybuy_feed_products -> Import data from CSV,
import parts 01 through 04 sequentially without clearing previously loaded rows.

After all four parts verify:

```sql
SELECT COUNT(*) AS imported,
 COUNT(*) FILTER (WHERE published) AS visible
FROM public.joybuy_feed_products;
```

Expected: **36,809 imported and 35,227 visible**. Do not activate before checking.
All products include image URL, Awin affiliate link, EUR item and shipping prices, category and brand.
The `product_type` feed column is entirely blank; 17 categories are mapped from Google product-category top-levels.
Descriptions were limited to 650 characters to keep database use small, source product images remain on JoyBuy's host.
632 products are marked out of stock and 957 are conservatively flagged as restricted/age-limited;
1,582 unique rows are unpublished (groups overlap). A human review is required before making excluded items visible.
Five products had a sale price higher than base price, so the lower recorded feed price was chosen.
Prices and stock are only a dated feed snapshot, not confirmed live.

## Enable only after import

Set `JOYBUY_CATALOG_ENABLED=true` in Hostinger runtime environment, then restart the Node.js app.
JoyBuy reuses the existing `SUPABASE_URL`/`SUPABASE_PUBLISHABLE_KEY`,
or for backward compatibility `SAMSUNG_SUPABASE_URL`/`SAMSUNG_SUPABASE_PUBLISHABLE_KEY`.
Do not set service-role or Awin feed-download tokens in website or repository.
Check /joybuy/, /api/joybuy/search/?q=LEGO and /suche/?q=LEGO&source=joybuy,
then recheck Samsung, eBay and Beauty.

Imported products and photos are never committed to GitHub. No automatic feed refresh is configured yet.
Future updates require a validated keyed upsert and full-feed reconciliation.
