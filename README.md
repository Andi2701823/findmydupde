# FindMyDup

FindMyDup is a German-language product discovery website for finding visually similar, more affordable alternatives to products.

## The user experience

1. Upload a product photo or screenshot, or enter a product name.
2. An image-recognition service can extract product attributes (such as category, color, shape, material, and style). Text search extracts the same intent without uploading an image.
3. Search a real product catalog for similar, possibly cheaper alternatives.
4. Display product images, titles, stores, prices (with timestamp if provided) and outbound retailer/affiliate links. Avoid invented products, claims, availability and prices.

## Build plan

- Phase 1: Next.js + TypeScript, accessible responsive German UI, photo-upload UI and text-search UI, example results clearly labeled as demo data, no live affiliate claims. Validate the complete flow.
- Phase 2: Connect image recognition securely on the server, a product database (e.g., Supabase), and authorized Awin product feeds. Add real search, filtering, matching and outbound tracking where permitted.
- Phase 3: Add production hosting on the existing Hostinger Business Web Hosting plan, connect findmydup.de after purchase, and complete legal/privacy compliance.

## Development principles

- Keep the first working version lean and inexpensive.
- Never commit API tokens, passwords, private affiliate feed URLs or personal credentials. Keep credentials in environment variables on the server.
- Protect uploaded images and consider privacy/retention and upload size/type limits.
- Do not present AI matches as identical products. Do not invent prices or availability.
- Keep the site independent of the owner's other websites.

Status: Phase 1 prototype implemented. Demo catalog only, no live integrations.

## Phase 1 implementation

The prototype now includes a responsive German homepage, text search, local image preview, an explicit category-based image demo, results with category/color/example-price filters, sorting, accessible product dialogs, and a browser-local favorites list. All eight products, illustrations and example prices are fictional fixtures. There are no retailer offers, purchase links, AI matches, external product images, analytics or paid services.

### Run locally

Use Node.js 22.13 or newer (Node 22 LTS recommended):

```sh
npm ci
npm run dev
```

Open `http://localhost:3000`. No environment variables or service accounts are needed.

### Checks and static export

```sh
npm run check
# Includes TypeScript, ESLint, 9 unit tests and the production static build.
npm run serve
# Serves out/ at http://localhost:3000 (requires Python 3).
```

Browser smoke tests run against the actual `out/` export:

```sh
npx playwright-core install chromium
npm run test:e2e
```

`CHROME_PATH` optionally selects a locally installed Chrome/Chromium binary. The browser tests start a temporary Python static server and cover search, filters, upload validation, image preview, product details, favorites persistence, storage failures, navigation and layouts at 375, 390, 768 and 1440 pixels. They also assert that the app makes no external requests or image uploads. Browser screenshots are written to ignored `test-artifacts/`.

### Project structure

- `app/`: App Router pages, German metadata, layout, responsive styles and 404.
- `components/`: Search, results, navigation, cards/dialogs and favorites.
- `lib/catalog.ts`: Fictional fixtures only; each has `source: 'demo'`.
- `lib/search.ts`: Deterministic text search, filters and `demoCatalog` provider.
- `lib/upload.ts`: JPG/PNG/WebP validation with a 5 MB size limit.
- `lib/types.ts`: Catalog, image-recognition and verified-offer integration contracts.
- `public/products/`: Original local SVG illustrations, no external downloads.
- `docs/hostinger.md`: Static upload instructions and hosting boundaries.
- `docs/integrations.md`: Server-side OpenAI, Supabase and Awin integration plan.
- `.github/workflows/check.yml`: Build and browser checks, with `out/` as a deployable artifact.

### Prototype boundaries

Images are previewed using revocable browser object URLs and are never uploaded. Image demo results use the category selected by the visitor, not image contents. Unknown text searches show an empty state. Prices and reference prices are labeled fictional, with no savings or availability claims. Favorites store only demo IDs in the current browser, with an in-memory fallback if storage is blocked.

This build uses `output: 'export'`, so it requires no Node.js server on Hostinger. API routes, image recognition, feed imports and database writes are not implemented. Before adding server features, upgrade Next.js/React to the current patched releases, enable a supported secure server runtime, and implement the safeguards in the integration plan. The current lockfile records the dependency versions tested for this static prototype.

Before public launch, replace the incomplete operator/legal pages, complete privacy disclosures, connect verified product data and remove the prototype's `noindex` and `robots.txt` restrictions only when the site is ready. The hostname has not been configured or deployed by this implementation.
