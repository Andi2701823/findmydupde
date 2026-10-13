# Dependency security verification

Checked on 2026-10-13 using the public npm registry.

Next.js: 16.4.0; eslint-config-next: 16.4.0.

Full audit: {"info":0,"low":0,"moderate":0,"high":7,"critical":0,"total":7}.

Production audit (omit=dev): {"info":0,"low":0,"moderate":0,"high":0,"critical":0,"total":0}.

Compatible direct releases were selected within their existing major lines, keeping Tailwind 3 and TypeScript 5. Overrides, if present, are restricted to compatible affected dependency lines. No force audit fix was used.

Validation: fresh npm ci, TypeScript, ESLint, nine unit tests, production static export, and browser smoke tests at 375, 390, 768 and 1440 px. Product search, local image upload preview, filters, favorites and static Hostinger deployment are preserved.
