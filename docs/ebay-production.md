# Safe eBay launch preparation on existing FindMyDup

This branch starts from the current main commit `9f33842c78d40d9f0fd2e9688f8e2fb4d82bcd71`. It preserves the production site's 63 bdr-beauty affiliate products, editorial guides, metadata, sitemap and design. Do not merge the older development/staging branch over main.

## Hostinger Node.js requirement

The existing site was built as Next.js `output: export`. OAuth API routes cannot run as static HTML. This change switches the root app to a normal Node.js Next server. Before merging to main or deploying, verify Hostinger Business is configured to run the Next.js Node 22 app with `npm run build` and `npm start`, not upload static `out/`. Retain the last working static main commit `9f33842c78d40d9f0fd2e9688f8e2fb4d82bcd71` as rollback. No production deploy or ENV changes are made by this branch.

## Explicit opt-in

Until Node deployment is ready, keep `DEPLOYMENT_ENV=production`, `EBAY_SEARCH_ENABLED=false` and `EBAY_PRODUCTION_ENABLED=false`. Activation needs BOTH eBay flags `true` after deployment and a rebuild so server-rendered search HTML reflects the new setting. Store `EBAY_CLIENT_ID` and `EBAY_CLIENT_SECRET` only as private Hostinger ENV variables; rotate any secret pasted into chat. Set `EBAY_MARKETPLACE_ID=EBAY_DE`. Keep DB, catalog, migration, import and image flags disabled. `EBAY_EPN_CAMPAIGN_ID` is optional and must be a real 10-digit campaign ID.

## Verification and rollback

After activation check `/api/ebay/search?q=drone` for `source=ebay`, `marketplace=EBAY_DE`, real items and ordinary eBay URLs when no real ePN ID is configured. Check `/suche/?q=drone`, all 63 beauty products, guides, mobile layout, robots, sitemap and metadata. The section does not claim products are cheaper. In case of errors set `EBAY_SEARCH_ENABLED=false`, rebuild, or revert to base `9f33842c78d40d9f0fd2e9688f8e2fb4d82bcd71`. Secrets must never appear in GitHub or responses.
