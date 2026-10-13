# Dependency security verification

Verified on 2026-10-13 using the live npm registry on GitHub Actions. No application pages, styles, search behavior, upload behavior or static hosting configuration were changed.

## Installed versions

| Package | Tested version(s) |
| --- | --- |
| next | 16.4.0, latest stable release at verification |
| eslint-config-next | 16.4.0 |
| react / react-dom | 19.3.0 |
| sharp | 0.35.5 |
| brace-expansion | 1.1.21 and 5.0.12 |
| source-map-js | 1.2.2 |
| postcss | 8.5.23 (Next.js dependency) and 8.5.30 (direct development dependency) |
| browserslist | 4.29.3 |
| js-yaml | 4.3.2 |
| postcss-selector-parser | 7.1.6 |
| tailwindcss | 3.4.19, retained to preserve the existing design and configuration |

Package.json and the lockfile were updated together with npm and validated by a fresh npm ci. No npm audit fix --force was used. Stable direct upgrades stayed within their existing major lines. Version-specific brace-expansion overrides select patched compatible versions.

The postcss-selector-parser override to 7.1.6 was reviewed explicitly. Its v7 change makes insertions during iteration safe. The complete production build and browser tests passed with the override, and the generated CSS before and after it was byte-identical (SHA-256: 6e3b79c89cb01c08a554158cf7da57b1526fbb7d1799d12d4344353541a38998). No Tailwind 4 migration or design change was made.

## Audit results

| Scope | Critical | High | Moderate | Low | Total |
| --- | --- | --- | --- | --- | --- |
| npm audit, all dependencies | 0 | 7 | 0 | 0 | 7 |
| npm audit --omit=dev | 0 | 0 | 0 | 0 | 0 |

The original lockfile produced 18 aggregated npm findings (1 critical, 13 high, 3 moderate, 1 low). npm's package-level aggregation can differ from GitHub's advisory/alert counts. The tables above are the actual final npm results, not a claim that every GitHub alert has been individually dismissed.

### Remaining development dependency chain

All seven high findings trace to one advisory: [GHSA-vfj7-8cjw-p6xm / CVE-2026-93687](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm), a stack-exhaustion denial of service in braces through 3.0.3. The upstream advisory lists no patched version at verification time.

Affected development packages:

- braces
- micromatch
- fast-glob
- chokidar
- tailwindcss
- @next/eslint-plugin-next
- eslint-config-next

These are development glob/file-watching/lint dependencies. Deeply nested untrusted patterns can terminate the tooling process. Build and lint inputs should therefore remain trusted repository/configuration sources. Product photos and text searches do not enter these tooling parsers. The production audit contains none of these findings.

npm suggests Tailwind 4 for part of this dependency chain and an eslint-config-next downgrade for another part. A Tailwind major migration would violate the requirement to preserve the existing styling setup, and downgrading the Next ESLint configuration would conflict with the corresponding-version requirement. Neither would provide a published patch for braces itself, so no blind force repair, version falsification or alert dismissal was performed.

The optional static fallback exports static-app/out/ without Node.js tooling. The root application now uses normal Node.js deployment, so its production dependencies are audited with npm audit --omit=dev. Build tools can still be installed on managed builders; their documented development risk is not erased by the runtime split.

## Verification

- Fresh npm ci from the regenerated lockfile
- Full npm audit and npm audit --omit=dev
- TypeScript checks
- ESLint
- All nine unit tests
- Production Next.js static export
- Identical generated CSS before/after the parser override
- Browser smoke tests at 375, 390, 768 and 1440 pixels
- Text search, empty states, category/color/budget filters and sorting
- Photo file type/size checks, decoded local preview, malformed image rejection and explicit image-demo results
- Product dialogs, favorites, storage failure handling and mobile navigation
- No external application requests or image uploads

The permanent CI workflow reports the full audit and permits only the documented braces advisory and its development dependency chain. New advisories, severities or packages fail that audit gate. The production audit has no exceptions and must remain clean.

[Verified remediation run](https://github.com/Andi2701823/findmydupde/actions/runs/38443738181).

## Upstream references

- [Latest Next.js release](https://github.com/vercel/next.js/releases/tag/v16.4.0)
- [Unpatched braces advisory](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm)
- [Patched selector-parser advisory](https://github.com/advisories/GHSA-rj75-hqrm-r3gf)
- [Selector-parser changelog](https://github.com/postcss/postcss-selector-parser/blob/main/CHANGELOG.md)
