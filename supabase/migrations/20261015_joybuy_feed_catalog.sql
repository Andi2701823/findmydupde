-- JoyBuy DE Awin feed, advertiser 123926; public read-only catalog.
CREATE TABLE IF NOT EXISTS public.joybuy_feed_products (
 external_id text PRIMARY KEY CHECK (external_id ~ '^[0-9]{1,24}$'),
 merchant_id text NOT NULL DEFAULT '123926' CHECK (merchant_id = '123926'),
 merchant_name text NOT NULL DEFAULT 'Joybuy DE',
 product_name text NOT NULL CHECK (length(product_name) BETWEEN 1 AND 300),
 description text NOT NULL DEFAULT '', category text NOT NULL,
 feed_category text NOT NULL DEFAULT '',brand text NOT NULL DEFAULT '',gtin text NOT NULL DEFAULT '',
 price_cents integer NOT NULL CHECK (price_cents > 0),
 original_price_cents integer NOT NULL CHECK (original_price_cents > 0),
 shipping_cents integer NOT NULL CHECK (shipping_cents >= 0),
 currency text NOT NULL DEFAULT 'EUR' CHECK (currency='EUR'),
 image_url text NOT NULL CHECK (image_url LIKE 'https://images1.joy-sourcing.com/%'),
 affiliate_url text NOT NULL CHECK (affiliate_url LIKE 'https://www.awin1.com/cread.php?%'),
 merchant_url text NOT NULL CHECK (merchant_url LIKE 'https://www.joybuy.de/%'),
 in_stock boolean NOT NULL DEFAULT false,
 published boolean NOT NULL DEFAULT false CHECK (NOT published OR in_stock),
 imported_at timestamptz NOT NULL DEFAULT now(),
 last_seen_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS joybuy_published_category_price_idx ON public.joybuy_feed_products(category,price_cents,external_id) WHERE published;
CREATE INDEX IF NOT EXISTS joybuy_published_brand_idx ON public.joybuy_feed_products(brand) WHERE published;
CREATE INDEX IF NOT EXISTS joybuy_published_price_idx ON public.joybuy_feed_products(price_cents,external_id) WHERE published;
ALTER TABLE public.joybuy_feed_products ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.joybuy_feed_products FROM PUBLIC;
REVOKE ALL ON TABLE public.joybuy_feed_products FROM anon, authenticated;
GRANT SELECT ON TABLE public.joybuy_feed_products TO anon, authenticated;
DROP POLICY IF EXISTS joybuy_public_published_select ON public.joybuy_feed_products;
CREATE POLICY joybuy_public_published_select ON public.joybuy_feed_products FOR SELECT TO anon, authenticated USING (published AND in_stock);
