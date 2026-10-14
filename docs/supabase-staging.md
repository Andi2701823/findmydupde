# FindMyDup: Supabase statt Hostinger-MySQL (nur Staging)

Stand 14.10.2026. Die bisherige MariaDB-Testumgebung bleibt unverändert.
`main`, `findmydup.de`, DNS, Hostinger-Live-Einstellungen und die
Produktionsdatenbank bleiben unverändert.

## Warum

Hostinger vergibt für den bestehenden MariaDB-Testbenutzer unmaskierte
Datenbank-Wildcard-Grants, die die strenge Rechteprüfung ablehnt. Diese Prüfung
wird **nicht** gelockert. Stattdessen steht ein separater PostgreSQL/Supabase-
Katalog als ausdrückliche Staging-Option bereit.

## 1. Supabase-Projekt / SQL

Ein separates, leeres Supabase-**Testprojekt** verwenden, niemals ein
bestehendes produktives Supabase-Projekt. Supabase arbeitet mit PostgreSQL,
nicht MySQL. Das vorhandene MySQL-Schema ist deshalb nicht direkt verwendbar.

Nach Sichtprüfung in Supabase > SQL Editor
[`db/supabase/001_catalog.sql`](../db/supabase/001_catalog.sql)
**einmalig** ausführen. Es erzeugt:

- `public.catalog_offers`: ausschließlich öffentliche Produkt-/Angebotsdaten;
  leer bis zu einem später genehmigten Awin-Import.
- `published=false` als Standard, RLS eingeschaltet, nur `SELECT` für `anon`
  und eine RLS-Policy für ausdrücklich veröffentlichte Zeilen.
- `public.search_catalog`: read-only (`STABLE`, `SECURITY INVOKER`),
  mit Such-, Preis-, Kategorie-, Farb-, Aktualitäts-, Sortier- und Seitenlimits.
  Den Funktionsaufruf darf `anon`, nicht aber `PUBLIC` oder `authenticated`
  ausführen. Die Tabelle gewährt `anon` kein INSERT/UPDATE/DELETE.

**Rechte prüfen** (nur im Supabase SQL Editor):

```sql
select
  has_table_privilege('anon', 'public.catalog_offers', 'SELECT') as can_read,
  has_table_privilege('anon', 'public.catalog_offers', 'INSERT') as can_insert,
  has_table_privilege('anon', 'public.catalog_offers', 'UPDATE') as can_update,
  has_table_privilege('anon', 'public.catalog_offers', 'DELETE') as can_delete;
```

Erwartet: `true, false, false, false`. Zusätzlich prüfen, dass RLS
aktiv ist. Ohne echten Datenimport sind `search_catalog('tasche')` und der
API-Endpunkt leer, **nicht** mit Demo-Angeboten gefüllt.

**Sicherheit:** `sb_publishable_` ist ein Publishable Key, kein Geheimschlüssel.
Trotzdem nur serverseitig als Umgebungsvariable verwalten, damit die
Anwendungsauthentisierung und Rate-Limits an unserem Next.js-Endpunkt bleiben.
Niemals einen `sb_secret_`-, `service_role`- oder Datenbank-Admin-Key in
Hostinger für diese öffentliche Suche hinterlegen. Der öffentlich verfügbare
Supabase Data-API-Endpunkt bleibt separat durch RLS und Grants geschützt.

## 2. Hostinger-Testwebsite umstellen

Verwenden: `beige-jellyfish-123405.hostingersite.com`, GitHub-Branch
`development/standard-next-mysql-20261013`. Nach dem SQL-Schritt
`.env.supabase-staging.example` als **Vorlage** benutzen und in der
Staging-App konfigurieren:

```dotenv
DEPLOYMENT_ENV=staging
CATALOG_BACKEND=supabase
SUPABASE_URL=https://PROJECT_REF.supabase.co
SUPABASE_PUBLISHABLE_KEY=sb_publishable_... 
SUPABASE_CATALOG_ENABLED=true
CATALOG_SEARCH_ENABLED=true
DATABASE_ACCESS_ENABLED=false
DB_MIGRATIONS_ENABLED=false
AWIN_IMPORT_ENABLED=false
IMAGE_SEARCH_ENABLED=false
HOSTINGER_STAGING_GRANT_COMPATIBILITY=false
STAGING_CATALOG_DIAGNOSTICS=false
```

Die Beispielplatzhalter nicht ungeprüft importieren; die Projekt-URL und den
Publishable Key aus dem eigenen Supabase-Dashboard einsetzen. Keine Zugangsdaten
in den Chat oder GitHub kopieren. Eventuelle `MYSQL_`-Variablen spielen bei
`CATALOG_BACKEND=supabase` keine Rolle. Der neue Modus lehnt bewusst das
gleichzeitige Aktivieren von `DATABASE_ACCESS_ENABLED=true` sowie Migrationen,
Imports und Bilderkennung ab.

**Noch nicht mit echten Keys aktiviert?** Flags
`SUPABASE_CATALOG_ENABLED=false`, `CATALOG_SEARCH_ENABLED=false` belassen.
Die Startseite läuft weiterhin mit gekennzeichneten Demoprodukten.

## 3. Prüfen

Nach dem Speichern neu deployen. Dann aufrufen:

`https://beige-jellyfish-123405.hostingersite.com/api/products/search/?q=tasche`

Erwartet bei leerem Supabase-Katalog: HTTP 200, `source=catalog`,
`offers=[]`. HTTP 503 bedeutet etwa: nicht vorhandene Tabelle/Funktion,
fehlende RLS-/EXECUTE-/SELECT-Rechte, falsche URL/Key oder Netzproblem.
Die öffentliche Antwort zeigt bewusst keine internen Fehlermeldungen.
HTTP 400 bei `q=x`, die Bildsuche bleibt deaktiviert.

Die **sichtbare Oberfläche** zeigt bislang weiterhin Demo-Artikel; die API
allein schaltet die Frontend-Suchkomponente nicht auf echte Angebote.
Echte Produktdaten und Awin-Imports müssen separat implementiert/freigegeben
werden. Der Import darf nicht mit dem öffentlichen Publishable Key erfolgen.

## 4. Rückbau

`CATALOG_SEARCH_ENABLED=false`, `SUPABASE_CATALOG_ENABLED=false` setzen
und die Testwebsite neu deployen. Kein Eingriff in die Live-Website nötig.

## Grenzen des aktuellen Standes

Der GitHub-Branch enthält eine PostgreSQL-Migration und REST-Anbindung, aber
die Migration wurde **noch nicht** im echten Supabase-Projekt ausgeführt.
Ohne direkt verfügbare Supabase-Verbindung sind weder Projektzugriff noch die
echten RLS-/API-Rechte geprüft. Lokale Mock-Tests ersetzen diesen Live-Test nicht.
