# eBay Browse API, staging only

The isolated GET /api/ebay/search?q=drone endpoint is available in the Next.js server app. When explicitly enabled, the staging storefront also searches eBay and displays real offers on /suche/. This remains separate from the demo fixtures and MySQL/Supabase catalog. The production storefront remains unchanged.

## Private Hostinger staging environment

Set DEPLOYMENT_ENV=staging, EBAY_SEARCH_ENABLED=true, EBAY_CLIENT_ID and EBAY_CLIENT_SECRET privately in hPanel for the staging deployment only. Keep CATALOG_SEARCH_ENABLED, DATABASE_ACCESS_ENABLED, DB_MIGRATIONS_ENABLED, AWIN_IMPORT_ENABLED, and IMAGE_SEARCH_ENABLED all false. Conflicting integrations make the eBay route return 503 and disable the staged eBay UI. Rotate the Client Secret previously pasted into chat before enabling. Never commit credentials or use NEXT_PUBLIC_ variables. EBAY_MARKETPLACE_ID defaults to EBAY_US; EBAY_DE is also supported. Optionally set EBAY_EPN_CAMPAIGN_ID to the 10-digit eBay Partner Network campaign ID, which is different from the App ID and Dev ID.

The integration obtains an OAuth client-credentials token with scope https://api.ebay.com/oauth/api_scope and uses it only server-side. The endpoint returns up to ten real eBay listings with a source marker, observed timestamp and URLs from eBay. Only an affiliate URL containing the exact configured 10-digit ePN campaign ID is labeled as an affiliate link. Any placeholder/mismatched/missing ePN ID falls back to the ordinary eBay listing URL without an affiliate claim. Offers are not stored, and lower-price comparisons are not yet calculated. Both EBAY_US and EBAY_DE markets can be configured; verify eligibility and prices for the chosen market.

## Test and rollback

After the staging deployment is configured, request GET /api/ebay/search?q=drone and inspect the JSON for source=ebay, ten or fewer items, real titles, original currency and valid eBay URLs. The API may return 503 if the OAuth credentials or eBay permissions are incorrect, or 429 if rate limited. Responses deliberately do not include upstream errors or secrets.

Set EBAY_SEARCH_ENABLED=false to disable the endpoint again. Production rejects it regardless of the flag. The visible text search is now wired for gated staging only. Image matching, final affiliate/legal disclosures, consent/privacy review, build verification, staging deployment and a real Hostinger OAuth/Browse API test are still required before a public launch. The main branch and production hosting settings must never be changed as part of the staging test.
