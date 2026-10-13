# FindMyDup: sichere Hostinger-Staging-Konfiguration

Stand: 13.10.2026. Diese Anleitung bereitet die Aktivierung vor. Sie führt keine
Hostinger-Aktion aus. `findmydup.de`, DNS, `public_html` und die vorhandene
Produktionsdatenbank bleiben unverändert. Keine neue Produktionswebsite oder
gekaufte Domain ist nötig.

## 1. Bestätigte bestehende Node.js-Website erhalten

Die bestätigte Live-Konfiguration ist Hostinger Business, Next.js auf Node 22.x,
Root `./`, Standard-Build/-Ausgabe und GitHub-Autodeploy von `main`.
Die Website läuft bereits als Node.js-App. Es ist keine Umstellung des Hostingtyps,
kein Entfernen der Website, keine neue Produktionswebsite und kein Domainwechsel
nötig. Frühere Hinweise zum Wechsel von rein statischem Hosting gelten hier nicht.

Die Backend-Routen liegen nun direkt unter `app/api/`. Der bisherige
`output: 'export'`-Modus war die technische Grenze: Er kann keine dynamischen
MySQL-Abfragen ausführen. Der root Standardbuild entfernt diese Grenze und nutzt
`next start`. Die Seiten, Komponenten und CSS bleiben unverändert.

- Dieser Stand liegt auf `development/standard-next-mysql-20261013`.
- Nicht nach `main` mergen und den Produktionsbranch in hPanel nicht umstellen.
  Ein Push/Merge nach `main` löst das bestehende automatische Deployment aus.
- Keine Hostinger- oder Datenbankeinstellungen der Live-Website für Tests ändern.
- Für einen späteren freigegebenen Release den letzten funktionierenden Commit,
  die aktuellen Deployment-Einstellungen und die Env-Konfiguration privat sichern.
  Eine DB-Sicherung erst bei später autorisiertem DB-Zugriff durchführen.

## 2. Standard-Next.js-Konfiguration auf Staging

Für eine getrennte, geschützte Testvorschau dieselbe Next.js-Konfiguration nutzen.
Diese Arbeit erstellt keine Hosting-App. Keine Zuordnung von `findmydup.de` und
keine DNS-Änderung. Wenn dein Account keine getrennte Vorschau anbietet, zunächst
CI/lokal nutzen, statt den Produktionsbranch umzuschalten.

| Einstellung | Wert |
| --- | --- |
| Repository | `Andi2701823/findmydupde` |
| Branch nur für Staging | `development/standard-next-mysql-20261013` |
| Root directory | `./` |
| Node.js | `22.x`, mindestens `22.13.0` |
| Framework | `Next.js` |
| Build settings | `Standard` |
| Output settings | `Standard`, normales `.next/` wird automatisch verwaltet |
| Build command, falls manuell nötig | `npm run build` |
| Start command, falls manuell nötig | `npm start` |
| Install command, falls separat verfügbar | `npm ci --include=dev` |

`npm run build` ist im Repository `next build --webpack`. `npm start` ist
`next start --hostname 0.0.0.0`. Die App verwendet Hostingers `PORT`.
Keinen eigenen server.js-Entry, keinen Standalone-Ausgabeordner und keinen
server-app-Build eintragen. Hostinger erkennt Next.js und verwaltet die
Server-Builddateien außerhalb von `public_html`.

Die Standards sind mit Next.js-Node-Deployment und Hostingers dokumentierter
Next.js-Backendunterstützung kompatibel. CI prüft exakt den normalen root Build
und `next start`. Ein tatsächlicher Hostinger-Staging-Deploy ist noch manuell zu
prüfen; diese Arbeit greift nicht auf hPanel zu. Sollte die Erkennung im konkreten
Account die Scripts nicht übernehmen, auf Staging als kleinste Alternative im
selben Projekt explizit `npm ci --include=dev && npm run build`, Ausgabe `.next`
und `npm start` setzen. Kein separates Backend-Projekt erforderlich.

`npm run build:static` bleibt ausschließlich ein optionaler statischer Rückweg
mit Ausgabe `static-app/out/`, ohne API-Routen. Er wird nicht von der
Standard-Node-Konfiguration aufgerufen. Das CI-Artefakt `hostinger-static-site`
enthält diesen Export. Nicht über die bestehende Node-App hochladen. `.env`,
Source und `node_modules` niemals öffentlich in `public_html` ablegen.

## 3. Staging zuerst ohne Datenbank starten

In der Staging-App unter Environment Variables einzeln eintragen:

```dotenv
NODE_ENV=production
NPM_CONFIG_INCLUDE=dev
HOSTNAME=0.0.0.0
DEPLOYMENT_ENV=staging
DATABASE_ACCESS_ENABLED=false
CATALOG_SEARCH_ENABLED=false
DB_MIGRATIONS_ENABLED=false
AWIN_IMPORT_ENABLED=false
IMAGE_SEARCH_ENABLED=false
DB_CONNECTION_TEST_ENABLED=false
TRUST_PROXY_HEADERS=false
```

`NPM_CONFIG_INCLUDE=dev` hält die für TypeScript/Tailwind benötigten Build-Abhängigkeiten auch bei automatischer Installation mit NODE_ENV=production verfügbar. Die Anwendung wird mit dem normalen Next.js-Server gestartet.

`PORT` kommt von Hostinger, nicht fest auf 3000 setzen. Keine Datenbankpasswörter,
Awin-Zugänge oder OpenAI-Schlüssel für diesen ersten Start eintragen. Die
Staging-Vorschau zeigt dieselbe Demo-Oberfläche. Upload-Vorschauen bleiben lokal.
`GET /api/products/search/?q=tasche` liefert 503, ebenso ein POST auf
`/api/image-search/`. Diese Antworten sind bei deaktivierten Integrationen erwartet.

Die Vorschau vor öffentlicher Nutzung durch Hostinger-Zugriffsschutz schützen,
falls verfügbar. Andernfalls ausschließlich die Tests in CI/lokal nutzen, bis
ein geeigneter Schutz bestätigt ist. `noindex` ist kein Zugriffsschutz.

## 4. Separate leere Staging-Datenbank

Erst im nächsten manuellen Schritt unter Databases → Management eine getrennte
Staging-Datenbank und getrennte Benutzer vorbereiten. Der Name muss einen eigenen
`staging`-Abschnitt enthalten, beispielsweise `u874339379_findmydup_staging`.
Das ist ein vorgeschlagener Name, keine bereits angelegte Datenbank.

Nicht `u874339379_findmydupde` und nicht deren vorhandenen Benutzer für Staging
verwenden. Die Vorlage `.env.staging.example` hat absichtlich leere DB-Felder.

| Variable | Staging-Wert |
| --- | --- |
| `MYSQL_HOST` | Der in Hostinger bestätigte Hostname, häufig `localhost` |
| `MYSQL_PORT` | `3306`, sofern Hostinger nichts anderes nennt |
| `MYSQL_DATABASE` | Vollständiger Name der separaten Staging-Datenbank |
| `MYSQL_USER` | Separater Benutzer mit ausschließlich SELECT-Rechten |
| `MYSQL_PASSWORD` | Neues Passwort, nur privat in hPanel eintragen |
| `MYSQL_CONNECTION_LIMIT` | `2` |
| `MYSQL_TLS_MODE` | `disabled` nur bei `localhost`/Loopback, sonst `required` |
| `MYSQL_SSL_CA` | Bei Remote-TLS die vertrauenswürdige PEM-CA, falls erforderlich |
| `CATALOG_MAX_AGE_DAYS` | `3` |

Falls hPanel keine getrennten SELECT-only-Rechte ermöglicht, mit Hostinger klären.
Der vorhandene Benutzername beweist keine passenden Rechte. Den Laufzeitbenutzer
nicht mit ALL PRIVILEGES einsetzen. Migrationen brauchen einen separaten Account;
dessen Zugangsdaten gehören nicht in die öffentliche Web-App.

Die Verbindung verwendet server-only-Module, vorbereitete SQL-Werte, Zeitlimits
und einen kleinen Pool. Es gibt keine `NEXT_PUBLIC_*`-Zugangsdaten. Remote-TLS
prüft Zertifikate. `rejectUnauthorized=false` wird nicht verwendet.

## 5. Verbindungstest vor Migrationen

Der Test ist ein CLI-Werkzeug, keine öffentliche Diagnose-URL und kein Startup-Hook.
Er läuft in einem vertrauenswürdigen Wartungsumfeld mit vollständigem Repository,
Node 22.13+ und `npm ci`. Hostinger dokumentiert, dass npm auf Business nicht
über SSH ausführbar ist. Daher nicht von einem verfügbaren hPanel-Terminal ausgehen.
Ein eigener Rechner darf nur mit ausdrücklich freigegebener Staging-Verbindung,
IP-Beschränkung und verifiziertem Remote-TLS verbinden. Kein allgemeines `%`-
Remote-Allowlisting. Wenn Hostinger diesen Weg nicht unterstützt, zunächst mit
Support einen sicheren einmaligen Wartungszugang vereinbaren.

Im privaten Wartungsumfeld die bestätigten Staging-DB-Werte setzen, dazu:

```dotenv
DEPLOYMENT_ENV=staging
DATABASE_ACCESS_ENABLED=true
DB_CONNECTION_TEST_ENABLED=true
DB_MIGRATIONS_ENABLED=false
AWIN_IMPORT_ENABLED=false
IMAGE_SEARCH_ENABLED=false
CATALOG_SEARCH_ENABLED=false
```

Dann, mit dem tatsächlich angelegten Namen:

```sh
npm run db:check -- --confirm --database=u874339379_findmydup_staging
```

Erwartet: JSON mit `connection: "ok"`, `version: "supported"`,
`privileges: "read-only"`, `schema: "not-checked"`. Das Werkzeug macht ausschließlich
SELECT/SHOW-Abfragen. Es prüft die ausgewählte Datenbank, MySQL 8+ oder MariaDB
10.6+ und SELECT-only/USAGE-Grants. Rollen, globale SELECT-Rechte und GRANT OPTION
werden vorsichtshalber abgewiesen. Bei Fehlern: Exit 1 und ein allgemeiner Hinweis,
keine Passwörter, Hostnamen, SQL-Fehler oder rohe Grant-Ausgaben.

Ohne Staging-Flag, bestätigten Staging-Namen oder bei aktivierten Schreibflags
wird vor der Verbindung abgebrochen. Die bekannte Produktionsdatenbank wird
ausdrücklich abgewiesen. Ein erfolgreicher lokaler Test ersetzt nicht die Prüfung
der Erreichbarkeit aus dem Hostinger-Node-Prozess.

## 6. Leeres Schema und API auf Staging prüfen

Die Migration nutzt InnoDB, utf8mb4_unicode_ci, Fremdschlüssel, DATETIME(3),
UUID-Zeichenfelder und ganzzahlige Centbeträge. Sie enthält keine Produkt-Seeds,
keine CREATE USER-/GRANT-Anweisungen und keine Anforderungen an SUPER-Rechte.
CI prüft MySQL 8.0 und MariaDB 10.11. Die tatsächliche Hostinger-Version bleibt
vor Ort zu bestätigen. Beim bestehenden Produktionsschema nichts ausprobieren.

Im getrennten Wartungsumfeld, ausschließlich mit Staging-Ziel und nach dessen
Sicherung, `DATABASE_ACCESS_ENABLED=true`, `DB_MIGRATIONS_ENABLED=true` und
separate `MYSQL_MIGRATION_USER`/`MYSQL_MIGRATION_PASSWORD` setzen. Der Account
braucht CREATE, REFERENCES sowie SELECT und INSERT für `schema_migrations`.
Dann:

```sh
npm run db:migrate -- --confirm
```

Danach Schreibflag wieder false, Wartungszugänge entfernen und den SELECT-only-
Account einsetzen:

```sh
npm run db:check -- --confirm --database=u874339379_findmydup_staging --schema
```

Jetzt muss `schema: "verified"` erscheinen. Der Test liest alle neun Tabellen
und vergleicht die Migrationshistorie mit den eingecheckten Dateiprüfsummen.
Die Migration erzeugt nur leere Tabellen. Keine Tests mit Demo-Angeboten gegen
Hostinger ausführen; `test:db` schreibt Fixtures nur in die isolierte CI-Datenbank.

In der Staging-Web-App die SELECT-only-DB-Werte eintragen, lediglich
`DATABASE_ACCESS_ENABLED=true` und `CATALOG_SEARCH_ENABLED=true` setzen und die
App in hPanel neu starten. Alle Schreib-/Bildflags und der Diagnose-Schalter
bleiben false. `GET /api/products/search/?q=tasche` muss HTTP 200 mit einem leeren
Katalog liefern. Das bestätigt Erreichbarkeit, Schema und Leserechte aus der
Web-App. Ungültiges `q=x` muss 400 liefern. Image-POST bleibt 503. Fehlerdetails
werden bewusst nicht öffentlich ausgegeben.

Die sichtbare Suche bleibt weiterhin die gekennzeichnete Demo. Das Aktivieren
der DB verbindet nicht automatisch die Oberfläche mit Live-Produkten. Ohne
autorisierten Feed gibt es keine echten Angebote. Awin/OpenAI bleiben deaktiviert.

## 7. Produktionsfreigabe und Rückweg

Noch kein Produktionszugriff. Vor einem späteren freigegebenen Wechsel:

1. Die geschützte Staging-Vorschau besteht Standardbuild, UI- und API-Prüfungen.
   Erst nach ausdrücklicher Freigabe den geprüften Entwicklungsbranch nach main
   übernehmen. Das startet den bestehenden Autodeploy. Keine Website entfernen,
   keine Domain wechseln und den Root/Framework-Standard unverändert lassen.
2. Tatsächliche Live-Dateien, Konfiguration und Produktionsdatenbank sichern,
   Wiederherstellung auf Staging prüfen und den geprüften Commit festhalten.
3. Produktionsversion/Rechte und bestehende Tabellen prüfen. Erst nach Freigabe
   Migrationen mit Wartungsaccount anwenden. Keine Demo-Produkte importieren.
4. In der freigegebenen Node-Laufzeit `DEPLOYMENT_ENV=production`, den bestätigten
   DB-Host, `MYSQL_DATABASE=u874339379_findmydupde`, einen nachweislich SELECT-only-
   Runtime-Account und dessen Passwort setzen. `u874339379_findmydup` nur verwenden,
   wenn dessen Rechte entsprechend begrenzt sind. Zunächst alle Flags false.
5. Nach geprüftem Routing nur DATABASE_ACCESS_ENABLED und CATALOG_SEARCH_ENABLED
   true setzen, dann neu starten und die API prüfen. DB_CONNECTION_TEST_ENABLED,
   DB_MIGRATIONS_ENABLED, AWIN_IMPORT_ENABLED und IMAGE_SEARCH_ENABLED bleiben false.
   Keine privilegierten Credentials oder API-Schlüssel in der Web-App belassen.

**Rückweg:** Bei API-Fehlern zuerst DATABASE_ACCESS_ENABLED und
CATALOG_SEARCH_ENABLED false setzen und die betroffene Node-App neu starten.
Die UI ist weiterhin ohne DB nutzbar. Bei Build-/Serverfehlern die letzte
funktionierende Node-Deployment-Version über Hostinger wiederherstellen oder den
Release-Commit auf main gezielt zurücknehmen und das bestehende Autodeploy nutzen.
Nur nach Releasefreigabe an main arbeiten. Hostinger behält laut Dokumentation
zwei erfolgreiche Build-Versionen, deshalb den letzten funktionierenden Commit
und die Konfiguration selbst festhalten. Fehlgeschlagene Builds ersetzen laut
Hostinger nicht die letzte erfolgreiche Version.

Ein Code-Rollback darf keine Datenbanktabellen oder Migrationshistorie entfernen.
Kein DROP TABLE, keine Löschung von `schema_migrations` und keine
Website-Entfernung als Rollback. Der optionale statische Export ist eine weitere
Dateisicherung, keine automatische Rücksetzung des Node-Hostings.

MySQL-DDL ist nicht atomar. Eine teilweise fehlgeschlagene Migration kann Tabellen
hinterlassen. Schreibzugriff dann deaktiviert lassen, Bestand/Sicherung prüfen
und kontrolliert wiederherstellen oder eine geprüfte Vorwärtsmigration planen.
Die Migration nicht blind erneut ausführen und angewendete Dateien nicht ändern.

## Checks

```sh
npm ci
npm run check
npx playwright-core install chromium
npm run test:e2e
npm run build:static
npm run test:static
```

CI ergänzt isolierte MySQL-/MariaDB-Tests, den read-only Verbindungscheck,
Server-Browsertests und npm audit (einschließlich separatem Produktions-Audit).
`npm run test:db` und `npm run test:server` nicht mit Hostinger-Zugangsdaten starten.

Quellen: [Hostinger Node.js inklusive Standarderkennung und SSH-Grenzen](https://www.hostinger.com/support/how-to-deploy-a-nodejs-website-in-hostinger/),
[Hostinger MySQL und Neustart nach Env-Änderungen](https://www.hostinger.com/support/connecting-a-hostinger-mysql-database-to-a-node-js-application/).
