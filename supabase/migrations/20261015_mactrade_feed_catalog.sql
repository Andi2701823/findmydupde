-- MacTrade DE Awin advertiser 13737 / feed 36137.
-- Only staging was migrated. Do not apply production without a separate review.
CREATE TABLE IF NOT EXISTS public.mactrade_feed_products (
  aw_product_id text PRIMARY KEY CHECK (aw_product_id ~ '^[0-9]{1,20}$'),
  merchant_product_id text NOT NULL CHECK (char_length(merchant_product_id) BETWEEN 1 AND 160),
  product_name text NOT NULL CHECK (char_length(product_name) BETWEEN 2 AND 300),
  description text NOT NULL DEFAULT '',
  category text NOT NULL CHECK (category IN ('MacBooks','Desktop-Macs','iPhones','iPads','Apple Watch','Audio','Zubehör','Apple TV','Restposten','Sonstiges')),
  merchant_category text NOT NULL DEFAULT '',
  price_cents integer NOT NULL CHECK (price_cents BETWEEN 1 AND 100000000),
  delivery_cents integer NOT NULL CHECK (delivery_cents BETWEEN 0 AND 10000000),
  image_url text NOT NULL CHECK (image_url LIKE 'https://www.mactrade.de/media/%'),
  affiliate_url text NOT NULL CHECK (affiliate_url LIKE 'https://www.awin1.com/pclick.php?%'),
  merchant_name text NOT NULL DEFAULT 'MacTrade' CHECK (merchant_name = 'MacTrade'),
  merchant_id text NOT NULL DEFAULT '13737' CHECK (merchant_id = '13737'),
  feed_id text NOT NULL DEFAULT '36137' CHECK (feed_id = '36137'),
  currency text NOT NULL DEFAULT 'EUR' CHECK (currency = 'EUR'),
  in_stock boolean NOT NULL DEFAULT false,
  published boolean NOT NULL DEFAULT false CHECK (NOT published OR in_stock),
  imported_at timestamptz NOT NULL DEFAULT now(),
  last_seen_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS mactrade_published_category_price_idx ON public.mactrade_feed_products(category,price_cents,aw_product_id) WHERE published AND in_stock;
ALTER TABLE public.mactrade_feed_products ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.mactrade_feed_products FROM PUBLIC,anon,authenticated;
GRANT SELECT ON public.mactrade_feed_products TO anon,authenticated;
CREATE POLICY mactrade_published_read ON public.mactrade_feed_products FOR SELECT TO anon,authenticated USING (published AND in_stock);
