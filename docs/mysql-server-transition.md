# MySQL integration and safe server transition

## Current state

The current root application remains the static German demo. `npm run build` still creates `out/`, using the existing design, local image preview, search, filters and favorites. No database account, key or paid service is required for that build. No production database was connected and no production migration or feed import was run by this implementation.

A separate `server-app/` Next.js target re-exports the existing pages and layout. It adds Node.js API routes while sharing the same CSS, components and generated copies of the local public assets. This avoids placing dynamic API routes inside the static-export application. The UI continues to use the clearly labeled demo provider; switching it to verified API data is a later, explicit release step.

`mysql2` with prepared SQL and reviewed, versioned migrations is the MySQL-compatible solution used here. No ORM engine, schema push, automatic database introspection or database connection occurs during builds. The driver creates a bounded pool lazily, only after explicit access flags and credentials are validated.

## Commands

```sh
npm ci
npm run check             # Default static application, types, lint and unit tests
npm run test:e2e          # Existing static browser suite
npm run build:server     # Separate Node.js build, does not connect to MySQL
npm run start:server     # Separate Next.js server; respects the PORT environment variable
npm run dev:server       # Development server target
```

Start and development commands optionally load the root `.env` with Node.js. Builds do not require it. Hostinger-provided process environment variables take precedence. Root `next.config.ts` remains `output: 'export'`; `server-app/next.config.ts` uses a standalone Node.js output, separate from the static export. The build packages the shared public and static assets into the standalone directory.

## Schema and migrations

`db/migrations/001_catalog.sql` creates:

| Table             | Purpose                                                                |
| ----------------- | ---------------------------------------------------------------------- |
| categories        | Slug/name hierarchy and category identity                              |
| retailers         | Merchant identity, website domain and explicit operator approval       |
| products          | Source identity, searchable attributes and active state                |
| offers            | Retailer-specific external product identity and last-seen availability |
| prices            | Immutable minor-unit price observations, currency and timestamps       |
| product_images    | Approved source image URLs and display order                           |
| affiliate_links   | Approved network links linked to retailer offers                       |
| feed_runs         | Import provenance, status and record counts                            |
| schema_migrations | Applied migration names, checksums and timestamps                      |

Foreign keys and unique source identifiers prevent orphaned records and accidental duplicate products/offers. There are no sample products, retailer offers, affiliate links or price seeds in the migrations. A similar-looking product is never automatically merged with another merchant's product. EUR is the initial API/import currency; other currencies are rejected rather than converted or compared misleadingly.

The migration runner uses an advisory lock and checks previously applied file checksums. MySQL DDL is not fully transactional: a interrupted schema migration requires operator inspection and recovery before continuing. Do not edit an applied migration. Add a new versioned file instead. MySQL 8 is exercised in CI; confirm the actual Hostinger MySQL/MariaDB version and privileges before staging activation.

After reviewing a **staging** target and backup, the explicit migration command is:

```sh
# Requires DATABASE_ACCESS_ENABLED=true, DB_MIGRATIONS_ENABLED=true,
# and a separate MYSQL_MIGRATION_USER / MYSQL_MIGRATION_PASSWORD.
npm run db:migrate -- --confirm
```

Migration or import commands are never invoked by `npm run build`, application startup or request handlers. Keep migration/import flags false in the public web process. Do not set production credentials during preparation.

## Environment and least privilege

`.env.example` contains only the provided database/account names and blank password fields. All access flags default to false. Runtime credentials are server-only, never `NEXT_PUBLIC_*`. Set the actual database hostname from the account's Hostinger database settings; do not assume a Node.js deployment can access every database via the same localhost address.

Use separate users:

- Runtime user: SELECT on the catalog tables only.
- Import user: SELECT, INSERT, UPDATE and DELETE on catalog/import tables, no schema privileges.
- Migration user: reviewed DDL and migration-history privileges only, used outside the web process.

Do not use the public web account for migrations or imports. The code does not fall back to runtime credentials for privileged roles. Provision these users/permissions through authorized Hostinger/database administration when staging activation is approved. The existing account name alone does not prove that it currently has read-only grants.

Local MySQL may use a local socket/TCP connection without TLS. Remote connections require certificate-verified TLS; the code rejects explicitly disabled remote TLS. Configure the trusted CA when required. Never disable certificate verification. Pool connections, queues and query timeouts are bounded to fit a lean hosting plan.

## Search API

Server target only:

`GET /api/products/search/?q=tasche&category=mode&color=Grün&maxPrice=50.00&sort=price-asc&page=1&pageSize=12`

The optional filters are category slug, color, maximum EUR price, sort (`recent`, `price-asc`, `price-desc`), page (1–50) and page size (1–24). Queries require 2–120 characters and at most six tokens. Duplicate/unknown parameters and unsupported sorting are rejected. All user values are prepared parameters, including escaped LIKE wildcards. The latest price observation is selected, disabled retailers/offers and out-of-stock or stale offers are excluded. Returned timestamps describe actual database observations, with no fabricated reference price or savings claim.

The API returns a typed catalog response, not demo fixtures. Empty data stays empty. Disabled integration is HTTP 503, invalid input is 400, rate-limit rejection is 429, and database failures return a generic 503 without SQL, passwords or connection details. Responses are no-store and have nosniff headers. URL output is checked again before serialization.

The in-memory quota is per Node.js process and is bounded. It is not a distributed rate limiter. Before exposing a public activated catalog, configure an appropriate host/proxy-wide request limit for the deployed process count. Forwarded IPs are ignored by default; enable `TRUST_PROXY_HEADERS` only if the actual trusted proxy strips caller-supplied `x-real-ip` and provides the correct client IP. No public write or import API exists.

Leading-wildcard searches are appropriate for an initial bounded catalog, but can scan many rows. Before large feeds, benchmark the indexed joins and move title matching to a tested FULLTEXT/search index. Keep query timeouts and quotas in place. Do not invent matches to hide a query failure.

## Awin preparation

`server/feeds/awin.ts` validates explicit Awin source fields, merchant/product IDs, real prices, currency, mapped categories, stock values and approved URL hosts. Missing prices are rejected. Missing stock becomes `unknown`, never assumed available. Approved HTTPS tracker domains and explicit image-host allowlists are enforced; no URL is fetched by this version.

`server/feeds/importer.ts` imports one complete validated batch (up to 250 rows) in a transaction, and only for an already approved merchant/category. Existing catalog identities are updated, new observed prices are appended and feed runs retain status. A failed batch rolls back catalog changes. A batch is not a complete-feed snapshot, so other offers are not automatically deleted or disabled.

A staged NDJSON import command is prepared:

```sh
# Explicit DATABASE_ACCESS_ENABLED / AWIN_IMPORT_ENABLED and dedicated import
# credentials are required, along with approved retailer/category/host policy.
npm run awin:import -- ./approved-staging-feed.ndjson --confirm
```

A future authorized CSV downloader/parser must implement `AuthorizedFeedSource`, enforce maximum file/row sizes, permitted advertiser agreements, safe redirect/host validation and feed refresh policies. `AWIN_FEED_URL` is a reserved environment variable, not a live fetch implementation. No network feed, scheduler or automatic product import is enabled. Private feed URLs and API tokens must never enter database responses, logs or git.

## Future image search

`POST /api/image-search/` is a disabled server boundary. It does not read/store images or contact OpenAI. Default behavior is 503; even setting the flag yields 501 until an actual adapter is implemented. This prevents a configured flag or key from pretending to provide image recognition.

The provider contract returns category/color/material/style attributes, never products or prices. Initial byte/type checks are prepared. Before activation, add actual image decoding, dimension/pixel limits, metadata stripping, consent/privacy disclosures, retention/deletion behavior, provider timeouts and abuse controls. Match attributes against verified database products and describe results as similar, not identical. `OPENAI_API_KEY` stays server-only and unused in this version.

## Hostinger rollout without disrupting the static site

Follow [the detailed staging and rollback runbook](hostinger-staging.md). The live
website and existing production database stay untouched during this preparation.
Do not remove/recreate the existing website or change its deployment settings.
Hostinger's current documentation says converting an existing domain may require
removing its website first. That procedure does not satisfy our no-interruption
requirement. Confirm an additive, reversible migration with Hostinger support
before any production cutover. A staging preview is not another production site.

The static build remains the default. Build `server-app/` only in an isolated
staging deployment, with all integration flags false first. Test a separate,
empty staging database with a SELECT-only runtime account. Keep Awin and image
recognition disabled throughout this task. The frontend still uses labeled demo
data; database activation alone does not switch the frontend to live offers.

References: [Hostinger Node.js apps](https://www.hostinger.com/support/how-to-deploy-a-nodejs-website-in-hostinger/), [Hostinger MySQL for Node.js](https://www.hostinger.com/support/connecting-a-hostinger-mysql-database-to-a-node-js-application/), [Next.js CLI directories](https://nextjs.org/docs/app/api-reference/cli/next), [mysql2 prepared statements/pools](https://sidorares.github.io/node-mysql2/docs).
