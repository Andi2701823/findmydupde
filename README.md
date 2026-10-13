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
- Hosting: findmydup.de is already live on Hostinger Business, Next.js/Node 22.x, standard settings, automatically deployed from main. This development branch does not change that deployment.

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

### Checks and production build

```sh
npm ci --include=dev
npm run check       # TypeScript, ESLint, unit tests and standard root Next.js build
npm start           # next start, listens on Hostinger's PORT
npx playwright-core install chromium
npm run test:e2e    # Complete UI browser suite against the production Node.js build
```

`npm run build` creates the normal `.next/` output. No database credentials or
paid services are needed. Dynamic API routes remain disabled by default.

An optional static fallback shares the existing pages and components, omits API
routes and is never used by the standard Hostinger deployment:

```sh
npm run build:static  # Export to static-app/out/
npm run serve        # Preview static fallback with Python 3
npm run test:static  # Same complete UI browser suite against the static fallback
```

Browser checks cover search, filters, uploads/previews, details, favorites,
storage failures, navigation and layouts at 375, 390, 768 and 1440 pixels.
`CHROME_PATH` optionally selects a local browser. No external requests or image
uploads are expected. Screenshots are written to ignored `test-artifacts/`.

### Project structure

- `app/`: Existing pages/design and disabled Node.js API routes.
- `components/`: Search, results, navigation, cards/dialogs and favorites.
- `lib/catalog.ts`: Fictional fixtures only; each has `source: 'demo'`.
- `lib/search.ts`: Deterministic text search, filters and `demoCatalog` provider.
- `lib/upload.ts`: JPG/PNG/WebP validation with a 5 MB size limit.
- `lib/types.ts`: Catalog, image-recognition and verified-offer integration contracts.
- `public/products/`: Original local SVG illustrations, no external downloads.
- `docs/hostinger.md`: Static upload instructions and hosting boundaries.
- `docs/integrations.md`: Server-side OpenAI, Supabase and Awin integration plan.
- `static-app/`: Optional static fallback, re-exports the same pages without APIs.
- `.github/workflows/check.yml`: Standard/static builds, browser checks and isolated MySQL/MariaDB tests.

### Prototype boundaries

Images are previewed using revocable browser object URLs and are never uploaded. Image demo results use the category selected by the visitor, not image contents. Unknown text searches show an empty state. Prices and reference prices are labeled fictional, with no savings or availability claims. Favorites store only demo IDs in the current browser, with an in-memory fallback if storage is blocked.

The root application uses the normal Node.js Next.js build, with dynamic route
handlers for catalog search and a disabled image-analysis boundary. Static export
cannot execute MySQL queries. The optional fallback is the only configuration
with `output: 'export'`. The frontend continues to use explicitly labeled demos.

Before public launch, replace the incomplete operator/legal pages, complete privacy disclosures, connect verified product data and remove the prototype's `noindex` and `robots.txt` restrictions only when the site is ready. The live hostname and Hostinger settings were not modified by this work.

## MySQL preparation in the main application

No separate server-app build is required. `app/api/products/search/route.ts` and
`app/api/image-search/route.ts` use the existing server-only MySQL handlers.
Runtime flags are read per request. Build/start do not open a connection, migrate,
import a feed or call OpenAI. The UI, components and styles are unchanged.

The reviewed schema/migrations live in `db/migrations/` and `server/db/`. Runtime,
import and migration accounts are separate, with no privileged fallback.
`.env.example` and `.env.staging.example` have no passwords and all access gates
false. No production database was connected.

See [MySQL preparation](docs/mysql-server-transition.md) for schema, least-
privilege accounts, feed validation and image boundaries. Hostinger uses standard
Next.js settings, root `./`, Node 22.x, `npm run build` and `npm start`.

## Safe Hostinger staging activation

The website is already live. Preparation must preserve that deployment. See
[the Hostinger staging runbook](docs/hostinger-staging.md) for exact build/entry
settings, a blank staging environment template, read-only connection checks,
migration compatibility checks and rollback. The new `npm run db:check` command
requires an explicitly confirmed staging database and rejects the known production
database. No database probes, migrations or imports run on application startup.
