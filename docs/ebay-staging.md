# eBay Browse API, staging only

The isolated GET /api/ebay/search?q=drone endpoint is available in the Next.js server app. This endpoint is separate from the existing demo UI and MySQL catalog. No production deployment, database mutation, or frontend switch is part of this change.

## Private Hostinger staging environment

Set DEPLOYMENT_ENV=staging, EBAY_SEARCH_ENABLED=true, EBAY_CLIENT_ID and EBAY_CLIENT_SECRET privately in hPanel for the staging deployment only. Rotate the Client Secret previously pasted into chat before enabling. Never commit credentials or use NEXT_PUBLIC_ variables. EBAY_MARKETPLACE_ID defaults to EBAY_US; EBAY_DE is also supported. Optionally set EBAY_EPN_CAMPAIGN_ID to the 10-digit eBay Partner Network campaign ID, which is different from the App ID and Dev ID.

The integration obtains an OAuth client-credentials token with scope https://api.ebay.com/oauth/api_scope and uses it only server-side. The endpoint returns up to ten verified eBay listings with a source marker, observed timestamp and URLs from eBay. Without a valid ePN campaign ID, it returns regular eBay item URLs rather than claiming affiliate tracking. It does not use placeholders from test responses as campaign IDs. Offers are not stored, and lower-price comparisons are not yet calculated.

## Test and rollback

After the staging deployment is configured, request GET /api/ebay/search?q=drone and inspect the JSON for source=ebay, ten or fewer items, real titles, original currency and valid eBay URLs. The API may return 503 if the OAuth credentials or eBay permissions are incorrect, or 429 if rate limited. Responses deliberately do not include upstream errors or secrets.

Set EBAY_SEARCH_ENABLED=false to disable the endpoint again. Production rejects it regardless of the flag. This is backend preparation only: UI wiring, image matching, affiliate disclosures, consent/legal review, build verification and real Hostinger API tests are still required before a launch.
