-- OFFLINE preparation, FIRST INITIALIZATION of the empty Hostinger staging database only.
-- Never run this against production. Stop on the first SQL error; DDL is not atomic.
-- Generated from the unchanged 001_catalog.sql. No product/retailer/price seed data.
USE `u874339379_findmyduptest`;
-- statement-breakpoint
CREATE TABLE schema_migrations (
  version VARCHAR(100) NOT NULL PRIMARY KEY, checksum CHAR(64) NOT NULL,
  applied_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
-- statement-breakpoint
-- Empty catalog schema. No product, retailer, price or affiliate seed data.
-- MySQL 8+ / compatible MariaDB. DDL is not transactionally rolled back by MySQL.
CREATE TABLE categories (
  id CHAR(36) NOT NULL PRIMARY KEY,
  slug VARCHAR(64) NOT NULL,
  name VARCHAR(120) NOT NULL,
  parent_id CHAR(36) NULL,
  UNIQUE KEY categories_slug (slug),
  CONSTRAINT categories_parent FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
-- statement-breakpoint
CREATE TABLE retailers (
  id CHAR(36) NOT NULL PRIMARY KEY,
  awin_merchant_id VARCHAR(30) NULL,
  name VARCHAR(160) NOT NULL,
  website_domain VARCHAR(253) NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT FALSE,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  UNIQUE KEY retailers_awin_merchant (awin_merchant_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
-- statement-breakpoint
CREATE TABLE products (
  id CHAR(36) NOT NULL PRIMARY KEY,
  source VARCHAR(20) NOT NULL,
  source_key VARCHAR(191) NOT NULL,
  title VARCHAR(300) NOT NULL,
  description TEXT NOT NULL,
  category_id CHAR(36) NOT NULL,
  color VARCHAR(40) NULL,
  material VARCHAR(80) NULL,
  active BOOLEAN NOT NULL DEFAULT FALSE,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  UNIQUE KEY products_source_key (source, source_key),
  KEY products_category_active (category_id, active),
  KEY products_title (title(100)),
  CONSTRAINT products_category FOREIGN KEY (category_id) REFERENCES categories(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
-- statement-breakpoint
CREATE TABLE offers (
  id CHAR(36) NOT NULL PRIMARY KEY,
  product_id CHAR(36) NOT NULL,
  retailer_id CHAR(36) NOT NULL,
  external_product_id VARCHAR(64) NOT NULL,
  availability VARCHAR(20) NOT NULL DEFAULT 'unknown',
  active BOOLEAN NOT NULL DEFAULT FALSE,
  last_seen_at DATETIME(3) NOT NULL,
  UNIQUE KEY offers_source_identity (retailer_id, external_product_id),
  KEY offers_product_active (product_id, active),
  KEY offers_freshness (last_seen_at),
  CONSTRAINT offers_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  CONSTRAINT offers_retailer FOREIGN KEY (retailer_id) REFERENCES retailers(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
-- statement-breakpoint
CREATE TABLE prices (
  id CHAR(36) NOT NULL PRIMARY KEY,
  offer_id CHAR(36) NOT NULL,
  amount_minor BIGINT UNSIGNED NOT NULL,
  currency CHAR(3) NOT NULL,
  observed_at DATETIME(3) NOT NULL,
  source_observed_at DATETIME(3) NULL,
  UNIQUE KEY prices_observation (offer_id, observed_at),
  KEY prices_latest (offer_id, observed_at, id),
  CONSTRAINT prices_offer FOREIGN KEY (offer_id) REFERENCES offers(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
-- statement-breakpoint
CREATE TABLE product_images (
  id CHAR(36) NOT NULL PRIMARY KEY,
  product_id CHAR(36) NOT NULL,
  url VARCHAR(2048) NOT NULL,
  position INT UNSIGNED NOT NULL DEFAULT 0,
  approved BOOLEAN NOT NULL DEFAULT FALSE,
  KEY images_product_order (product_id, position),
  CONSTRAINT images_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
-- statement-breakpoint
CREATE TABLE affiliate_links (
  id CHAR(36) NOT NULL PRIMARY KEY,
  offer_id CHAR(36) NOT NULL,
  network VARCHAR(20) NOT NULL,
  url VARCHAR(2048) NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT FALSE,
  observed_at DATETIME(3) NOT NULL,
  UNIQUE KEY affiliate_offer_network (offer_id, network),
  CONSTRAINT affiliate_offer FOREIGN KEY (offer_id) REFERENCES offers(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
-- statement-breakpoint
CREATE TABLE feed_runs (
  id CHAR(36) NOT NULL PRIMARY KEY,
  retailer_id CHAR(36) NOT NULL,
  source VARCHAR(20) NOT NULL,
  status VARCHAR(20) NOT NULL,
  record_count INT UNSIGNED NOT NULL DEFAULT 0,
  observed_at DATETIME(3) NOT NULL,
  completed_at DATETIME(3) NULL,
  CONSTRAINT feed_run_retailer FOREIGN KEY (retailer_id) REFERENCES retailers(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- statement-breakpoint
INSERT INTO schema_migrations (version,checksum) VALUES ('001_catalog.sql','8ae73c8ea6b779ff23a89342274186b165a9c22a1105ca273e4e4f3c9cf51ee9');
