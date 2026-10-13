# Hostinger deployment

## Static prototype, the default

The Next.js config exports the application to static HTML, CSS, JavaScript and local SVGs. This works on web hosting that serves static files and does not require a running Node.js application or a paid API.

1. Run `npm ci` with Node 22 LTS, then `npm run check`.
2. The build creates `out/`, including `index.html`, route directories, `404.html`, `_next/`, `robots.txt` and the product illustrations.
3. Preview with `npm run serve`. Visit `/suche/` and `/merkliste/` directly, and try a search after refreshing the browser.
4. In Hostinger hPanel, choose the separate website/domain intended for FindMyDup. Back up any existing files in that site's document root.
5. Upload the **contents** of `out/` into that website's `public_html` document root. Do not upload the enclosing `out` directory, source code, `node_modules`, `.env` files or `.next`.
6. Enable HTTPS and verify homepage, `/suche/?q=Tasche`, `/merkliste/`, local images and refresh on each page.
7. Configure the host's custom 404 page to `/404.html`, if desired. Normal routes use trailing slashes and directory `index.html` files, so there is no SPA catch-all rewrite requirement.

The GitHub workflow also uploads `out/` as the `hostinger-static-site` artifact after checks pass. Download and unzip it for the same upload procedure. No Hostinger credentials are stored in the repository, and no automatic deployment is configured.

## Later server integration

Hostinger documents Node.js web app hosting for Business and Cloud plans. Confirm that the feature is available in the existing account before choosing that deployment mode. A normal static file upload cannot run OpenAI recognition, server-side Supabase access, or feed import jobs.

For a future server deployment, first upgrade framework dependencies to current patched versions, remove `output: 'export'`, configure a supported Node runtime and `next start`, implement authenticated server endpoints with rate/size limits, and put all credentials in server environment variables. An alternative is to retain the static frontend and connect a separately secured backend. Do not expose private feed URLs, OpenAI keys or Supabase service-role credentials through `NEXT_PUBLIC_*` variables.

## Launch status

This is a prototype, not a live retailer search. Operator information and full privacy/legal pages must be completed before public launch. `robots.txt` disallows crawling and page metadata is `noindex, nofollow`. These are indexing controls, not access control. Use a protected test location if the prototype must remain private. The repository does not claim that findmydup.de is purchased, connected or live.

## References

- [Next.js static exports](https://nextjs.org/docs/app/guides/static-exports)
- [Hostinger Node.js web apps](https://www.hostinger.com/support/how-to-deploy-a-nodejs-website-in-hostinger/)
