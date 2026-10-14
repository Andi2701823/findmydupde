# FindMyDup: Hauptdomain-Übernahme ohne Produktionszugriff (Freigabeplan)

Stand: 14. Oktober 2026. **Dieser Plan ist eine Vorbereitung, keine Freigabe oder Deployment-Ausführung.**
Ein Merge nach `main` löst laut bestehender Hostinger-Konfiguration einen **automatischen Live-Deploy** aus.
Deshalb ist ein Merge bis zur gesonderten ausdrücklichen Freigabe verboten.

## Ausgangspunkt

- Repository: `Andi2701823/findmydupde`
- Produktionsbranch: `main`
- Letzter beim ersten Vergleich gelesener Merge-Base-`main`-Commit: `bad8397ecb3227bf4c1f10717e24b7bb27177d16`.
  Vor der Freigabe neuen HEAD abgleichen, nicht blind alte SHA verwenden.
- Getesteter Entwicklungsbranch: `development/standard-next-mysql-20261013`
- Staging: `https://beige-jellyfish-123405.hostingersite.com/`
- Live: `https://findmydup.de/`
- Vergleich am 14.10.: Entwicklungsbranch 55 Commits voraus, 0 hinter `main`, 68 veränderte Dateien.
- CI bis zum Entwicklungsstand `8595baf070ff8bba3ac1d8eb358da5d09c6d1791` hat fünf grüne Jobs; **die neu hinzugefügte Produktions-MySQL-Sperre muss gesondert mit anschließendem CI überprüft werden**.
- Eine unabhängige HTTP- und Browserkontrolle von Staging und Live war mit den verfügbaren Webzugriffen nicht möglich. **Eine erfolgreiche CI ersetzt keinen echten Live-Hostinger-Smoke-Test.**

## Ziel des ersten Releases

Zuerst eine ehrliche und professionelle **Publisher-/Partnerpräsentation**, keine öffentliche Live-Awin-Suche.
Neue Seiten: `/ueber-uns/`, `/partner/`, `/ratgeber/`, Impressum und Datenschutz.
Bestehendes Design, responsive Navigation, lokale Demo-Merkliste und deutlich markierte **fiktive** Produktbeispiele bleiben.

Nicht Teil dieses Releases:
- Keine echten Awin-Produktfeeds, Händlerpreise, Affiliate-Links oder Bild-Downloads.
- Keine OpenAI-Bildanalyse oder Nutzerbild-Uploads.
- Kein MySQL- oder Supabase-Produktionskatalog.
- Keine Schemaänderung, keine Datenbankmigration, kein Datenimport.
- Keine DNS-Änderung, kein neues Hostingprojekt, keine neue Domain.
- **Keine Änderung bestehender produktiver MySQL-Daten oder Hostinger-Datenbankrechte.**

## Explizite Sicherheitsschranken

- `server/db/config.ts` blockiert ab dieser Vorbereitung alle drei MySQL-Rollen
  `read`, `import` und `migration`, sobald `DEPLOYMENT_ENV=production` gesetzt ist.
  Das bleibt selbst bei fehlerhaften `DATABASE_ACCESS_ENABLED=true`-Flags wirksam.
- `server/catalog/live-mode.ts` und `server/db/supabase-catalog.ts` erlauben die
  Supabase-Katalogsuche **nur** bei `DEPLOYMENT_ENV=staging` und expliziten Schaltern.
- `app/api/image-search/` enthält keine aktivierte OpenAI-Verarbeitung.
- Die **korrekte Produktionsumgebung** muss vor Freigabe im hPanel vom Betreiber bestätigt
  werden. Die Entwicklungsbranch-/Staging-Environment-Werte nicht auf den Live-Host kopieren.
- Es wurden keine Live-Hostinger-Einstellungen und keine Live-Datenbank geprüft oder verändert.

### Erwartete Live-Environment-Variablen für eine DEMO-ONLY-Freigabe

Nur nach einer **separaten** Freigabe kontrolliert in der vorhandenen Live-Website setzen:

```dotenv
DEPLOYMENT_ENV=production
DATABASE_ACCESS_ENABLED=false
CATALOG_SEARCH_ENABLED=false
DB_MIGRATIONS_ENABLED=false
AWIN_IMPORT_ENABLED=false
IMAGE_SEARCH_ENABLED=false
SUPABASE_CATALOG_ENABLED=false
DB_CONNECTION_TEST_ENABLED=false
HOSTINGER_STAGING_GRANT_COMPATIBILITY=false
STAGING_CATALOG_DIAGNOSTICS=false
TRUST_PROXY_HEADERS=false
```

- Entfernen oder leer lassen: `CATALOG_BACKEND`, `SUPABASE_URL`,
  `SUPABASE_PUBLISHABLE_KEY`, MySQL-/Awin-/OpenAI-Zugangsdaten.
- `NODE_ENV=production` ist das standardmäßige Next.js-Produktionsprofil;
  davon nicht auf `DEPLOYMENT_ENV` schließen. Beide haben verschiedene Zwecke.
- Bei der Live-Node-App: Node 22.x (mindestens 22.13), Root `./`, Framework
  Next.js, normale Build-/Output-Einstellung, `npm run build` / `npm start`.
- Alle echten Secrets ausschließlich in Hostinger, niemals hier oder in GitHub speichern.

## Freigabe-Gates (der Reihe nach)

1. **Live-Zustand sichern**: Letzten funktionierenden `main`-Commit, Hostinger-Deployment-ID,
   aktuelle Node.js-/Build-Einstellungen und Environment-*Namen und Werte* **privat**
   beim Betreiber dokumentieren. Nie Screenshots mit Secrets teilen. Bei unklarer
   Rollbackfunktion mit Hostinger klären, bevor ein Merge erfolgt.
2. **Staging prüfen**: Hostinger hat tatsächlich den neuesten freigegebenen Commit
   vom Entwicklungsbranch deployed. Seite und Pflichtseiten auf iPhone und Desktop
   laden; keine 404/500, responsive Navigation, Links und Suche prüfen.
3. **Inhalte rechtlich prüfen**: Bestehende Impressumsangaben verifizieren; Betreiberstatus,
   ggf. erforderliche Zusatzpflichten prüfen. Datenschutzhinweise zu Hostinger,
   Supabase, Speicherung, Verbindungsdaten und späteren Fremdbildern fachlich prüfen.
   Die Datenschutzerklärung kennzeichnet sich aktuell selbst als Entwurf.
4. **Offene Sicherheits-PR und Abhängigkeiten**: Bestehenden separaten
   GitHub-Sicherheits-PR #1 prüfen. `npm audit --omit=dev`, Build, Unit-, Browser-,
   Static- und Datenbanksicherheitstests müssen auf dem **genauen Release-SHA**
   erfolgreich laufen. CI nimmt aktuell eine dokumentierte Ausnahme für
   `braces`-bezogene **Entwicklungsabhängigkeiten** an. Review erforderlich.
5. **SEO absichtlich entscheiden**: Derzeit global `robots: {index:false,follow:false}`
   und `public/robots.txt` mit `Disallow: /`. Damit wird eine Übernahme
   noch **nicht** öffentlich indexierbar. Keine Index-Freigabe ohne geprüften,
   endgültigen Inhalt und Betreiberfreigabe; SEO-Freigabe ist ein gesonderter Schritt.
6. **Vorbereitung des Merges**: Draft-PR vom Entwicklungsbranch nach `main`,
   mit diesem Plan und Blockern. Draft nicht auf „Ready“ stellen und
   auf keinen Fall mergen, bevor Besitzer ausdrücklich den LIVE-Rollout genehmigt.
7. **Gesonderte Freigabe**: Betreiber genehmigt schriftlich den konkreten
   Release-SHA, Zeitpunkt und die DEMO-ONLY-Umgebung nach Prüfung der Punkte 1–5.
   Ohne Zustimmung ist **kein** Merge/Deploy zulässig.

## Smoke-Test unmittelbar NACH einem gesondert genehmigten Deploy

Per HTTPS auf `https://findmydup.de/` und mobil prüfen:

| URL | Erwartet |
| --- | --- |
| `/` | Startseite, Bilder, vier Kategorien, echte Projektbeschreibung |
| `/suche/?q=tasche` | Deutlich gekennzeichnete DEMO-Treffer statt echte Händler |
| `/suche/?q=zzzzunbekannt` | Ehrlicher Leerzustand, keine erfundenen Live-Treffer |
| `/ueber-uns/` | Projektinfo erreichbar |
| `/partner/` | Händlerinformation und Kontakt erreichbar |
| `/ratgeber/` | Sachlicher Einkaufsratgeber erreichbar |
| `/impressum/` | Richtiger Betreiber und Kontakt |
| `/datenschutz/` | Geprüfter, tatsächlich zutreffender Text |
| `/api/products/search/?q=tasche` | HTTP **503** mit `CATALOG_DISABLED` |
| `POST /api/image-search/` | HTTP **503** mit `IMAGE_SEARCH_DISABLED` |
| `/robots.txt` | `Disallow: /` bis SEO-Freigabe |

Zusätzlich prüfen: keine Awin-Links, keine echten Händlerpreise, keine
Datenbankverbindungen und keine Schreiboperationen. Browserkonsole und
Netzwerkrequests kontrollieren; keine Geheimnisse oder Fehlerstapel öffentlich.
Hostinger-Protokolle bei Problemen ausschließlich in hPanel privat prüfen.

## Rollback nur bei später genehmigtem Release

- Bei Fehlern keine Datenbankstruktur oder Daten korrigieren: sie wurde nicht
  verändert. Website zuerst über Hostingers vorige funktionierende Deployment-
  Version oder den gesicherten `main`-Commit zurücksetzen **nach Freigabe**
  und dabei die ursprünglichen Environment-Werte wiederherstellen.
- Keine ungeprüfte Force-Push-Aktion, kein `git reset --hard` in `main`, keine
  Änderung von Live-DNS oder `public_html`.
- Nach Rückbau alle wichtigen Seiten erneut testen.
- Staging und Supabase-Testprojekt bleiben unabhängig erhalten.

## Offene Blocker per 14.10.2026

- Betreiber hat noch **keine ausdrückliche Live-Deployment-Freigabe** erteilt;
  die Anweisung lautete nur „Übernahme vorbereiten, ohne die Live-Website zu verändern“.
- Exakter Hostinger-Produktions-Env-/Rollback-Stand nicht verfügbar.
- Technischer externer HTTP-Check für die beiden Hostnamen nicht abgeschlossen.
- Datenschutzhinweise und Impressum noch nicht abschließend rechtlich abgeglichen.
- Das geplante Suchprodukt ist noch im DEMO-/Staging-Stadium.
- SEO bewusst deaktiviert und reale Händlerdaten nicht autorisiert.
