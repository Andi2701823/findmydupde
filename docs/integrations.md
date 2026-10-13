# Phase 2 integration boundaries

No external SDK, secret or paid service is needed or contacted by the prototype. These interfaces are preparation, not implemented integrations.

## Catalog provider

`CatalogProvider` currently returns explicit demo fixtures. The results component depends on this interface, not directly on a retailer feed. A production provider must use a separate verified product/offer model and expose its true source, currency, observation timestamp, availability when known, retailer and permitted outbound URL. Never put demo fixtures into production responses or use them as a fallback when an integration fails. Show a clear unavailable/empty state instead.

`VerifiedOffer` is a starting DTO for authorized Awin data. Before implementation, extend `CatalogProvider` to a discriminated union of demo and verified results, update product cards and filters to understand verified amounts, and format real prices with their observation time. An uploaded image gives no original price, so “cheaper” requires a verified comparison price from the user or catalog. Without one, show similar products ordered by price, without a savings claim.

## OpenAI image recognition, server only

`ImageRecognizer.recognize()` should eventually extract structured category, color, silhouette, material candidates and style attributes. It must not invent purchasable products or prices. Feed attributes into the real catalog query and label visual matches as similar, not identical. Do not infer equal quality or cosmetic performance from visual similarity.

Use a server endpoint or secured backend, with `OPENAI_API_KEY` in server environment variables. Authenticate or rate-limit requests, enforce upload limits again on the server, validate actual decoded image format and dimensions, reject malformed files and excessive decompression/pixel counts, and avoid fetching arbitrary user-supplied URLs. The demo's client MIME/size validation is a usability check, not sufficient server protection.

Obtain the required privacy disclosures before sending images to a third-party service. Define retention/deletion behavior, strip unnecessary metadata, avoid logging image contents, and never persist uploads by default. Handle timeouts and recognition failure honestly. Keep the current category-based image demo separate from the real recognizer.

## Supabase

A future catalog could use separate `products`, `offers`, `feed_runs` and optional `match_attributes` tables. Keep products distinct from offers so one product can have multiple sellers or changing prices. Store source identifiers, ingestion timestamps and observed price timestamps.

Only an authorized server import process may write feed data, using server-only service-role credentials. Enable RLS and least-privilege policies. Public reads must expose only permitted catalog fields; exclude private feed URLs, credentials and account metadata. This prototype's local favorites do not need user accounts or a database.

## Authorized Awin product feeds

Import only feeds and image/link fields permitted by the approved advertiser relationship. A feed adapter should validate types, currencies, nonnegative amounts, timestamps, product identifiers and URLs; deduplicate by source ID and preserve original provenance. Do not treat image URLs or feed descriptions as trusted HTML. Restrict outbound and image URL schemes, handle removals/unavailable items and mark stale offers clearly. Never substitute fictional prices for missing prices.

Imports belong in a protected server job or backend task, not in visitors' browsers. Keep `AWIN_FEED_URL` and any Awin tokens private. The feed schedule should follow allowed refresh rates and the hosting runtime's capabilities. Add affiliate disclosure and permitted tracking only when real outbound links exist.

## Validation before activation

Exercise actual ingestion, database permissions, recognition failures, catalog retrieval, filters, timestamps and outbound links in a controlled environment. Maintain a development-only demo mode that cannot accidentally appear as verified production offers. Update privacy/operator pages and review dependencies before changing the hosting mode. Do not remove noindex merely because an API key is configured.
