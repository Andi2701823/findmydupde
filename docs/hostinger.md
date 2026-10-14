# Hostinger deployment

The owner confirmed findmydup.de is already live on Business Web Hosting with
Next.js, Node 22.x, root ./, standard build/output settings and GitHub autodeploy
from main. Do not replace that website or change main during development.

The development branch integrates disabled APIs into the root Next.js app.
`npm run build` creates normal .next/ output; `npm start` runs next start on the
host-provided PORT. Hostinger's Next.js preset supports the Node.js backend.
No standalone server-app build or custom server entry is required.

See [the exact staging and activation runbook](hostinger-staging.md) for settings,
server-only environment variables, read-only checks and rollback. Start with all
integration flags false and no database credentials. Approve a release separately
before merging into main or activating production database access.

## Optional static fallback

`npm run build:static` creates static-app/out/ by re-exporting the unchanged
pages without API routes. `npm run test:static` exercises that export and
`npm run serve` previews it with Python. The hostinger-static-site CI artifact
contains the optional export, not a replacement for the live Node.js deployment.
Do not upload it over the current app or expose .env, source or node_modules in
public_html. A Node rollback should use the last working Node deployment/commit
and environment configuration, leaving database data intact.

## Prototype boundaries

The visible catalog remains clearly labeled demo data. No real retailer prices,
Awin import or image recognition is activated. Noindex/robots controls remain
unchanged and do not provide access control for staging.

References: [Hostinger Node.js apps](https://www.hostinger.com/support/how-to-deploy-a-nodejs-website-in-hostinger/),
[Next.js Node deployment](https://nextjs.org/docs/app/getting-started/deploying).
