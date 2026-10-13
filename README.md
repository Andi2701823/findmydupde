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

Status: project initialized. Application code to be developed using Codex.
