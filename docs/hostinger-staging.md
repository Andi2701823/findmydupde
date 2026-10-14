# FindMyDup: sichere Hostinger-Staging-Konfiguration

Stand: 14.10.2026. Diese Anleitung bereitet die Aktivierung vor. Sie führt keine
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

## 4. Bestätigte Staging-Datenbank, ein Benutzer

Hostinger erlaubt hier einen Benutzer pro Datenbank. Wir verwenden ausschließlich:

- Datenbank: `u874339379_findmyduptest`
- Benutzer: `u874339379_findmyduptest`
- Produktionsdatenbank `u874339379_findmydupde`: nicht verwenden oder bearbeiten.

Der konkrete Testname ist ausdrücklich zugelassen, ohne beliebige Namen mit
"test" freizugeben. Mit DEPLOYMENT_ENV=staging werden Produktions-/unbestätigte
Ziele schon vor einer Verbindung für Lesen, Migration und Import abgewiesen.
Der CLI-Test braucht weiterhin --confirm und exakt den konfigurierten DB-Namen.

Die drei Credential-Präfixe beschreiben getrennte **Prozesse**, nicht zwingend
verschiedene MySQL-Konten. Derselbe Staging-Benutzer darf im Wartungsprozess
explizit als MYSQL_MIGRATION_USER bzw. später MYSQL_IMPORT_USER gesetzt werden.
Es gibt weiterhin keinen automatischen Fallback auf MYSQL_USER/MYSQL_PASSWORD.
Rechte desselben Kontos gelten für alle seine Verbindungen. Eine Trennung allein
über Env-Variablen isoliert diese Rechte nicht.

| Variable in der Staging-Web-App | Wert |
| --- | --- |
| DEPLOYMENT_ENV | staging |
| MYSQL_HOST | Bestätigter Hostname aus Hostinger, häufig localhost |
| MYSQL_PORT | 3306, sofern Hostinger nichts anderes nennt |
| MYSQL_DATABASE | u874339379_findmyduptest |
| MYSQL_USER | u874339379_findmyduptest |
| MYSQL_PASSWORD | Erst nach SELECT-only privat in hPanel eintragen |
| MYSQL_CONNECTION_LIMIT | 2 |
| MYSQL_TLS_MODE | disabled nur bei localhost/Loopback, sonst required |
| MYSQL_SSL_CA | Vertrauenswürdige PEM-CA für Remote-TLS, falls erforderlich |
| CATALOG_MAX_AGE_DAYS | 3 |

.env.staging.example enthält die bestätigten Namen, aber kein Passwort. Alle
Aktivierungsflags sind false. Zugangsdaten sind server-only, niemals NEXT_PUBLIC.
Remote-Verbindungen prüfen Zertifikate. Keine Änderung an der Produktions-App.

## 5. Stufe 1: leere Schema-Migration mit temporären Rechten

**Diese Schritte sind vorbereitet, nicht ausgeführt.** Erst nach gesonderter
Staging-Freigabe ausführen. Die Staging-Web-App darf während der Rechteerhöhung
keine DB-Verbindung oder gültige Wartungszugangsdaten besitzen.

1. In der Staging-App DATABASE_ACCESS_ENABLED, CATALOG_SEARCH_ENABLED,
   DB_MIGRATIONS_ENABLED, AWIN_IMPORT_ENABLED, IMAGE_SEARCH_ENABLED und
   DB_CONNECTION_TEST_ENABLED auf false belassen/setzen. MYSQL_PASSWORD entfernen;
   MYSQL_MIGRATION_* und MYSQL_IMPORT_* müssen dort fehlen. App neu starten, um
   bestehende Pools zu schließen. Such-API muss CATALOG_DISABLED/503 liefern.
2. hPanel → Websites → Dashboard → Databases → Management öffnen. Nur die Zeile
   `u874339379_findmyduptest` auswählen. Bei einem bereits vorhandenen Schema nicht
   blind initialisieren: über phpMyAdmin prüfen und zuvor eine Staging-Sicherung
   herunterladen. Der vorbereitete Initialisierungsweg ist nur für eine leere DB.
3. In dieser Zeile über ⋮ → Change Password ein Wartungspasswort setzen, das
   ausschließlich im privaten Wartungsumfeld/phpMyAdmin verwendet wird. Dadurch
   ist ein früheres Passwort aus der Web-App nicht für neue erhöhte Verbindungen
   nutzbar. Andere Prozesse mit diesem Konto vorher ebenfalls schließen.
4. ⋮ → Change Permissions: nur SELECT, INSERT, CREATE und REFERENCES temporär
   aktivieren, alle anderen Häkchen einschließlich ALL PRIVILEGES/GRANT OPTION
   entfernen, dann Update. Diese Rechte genügen für die bestehende Migration 001
   und ihre Historie. Kein DROP, ALTER, UPDATE, DELETE oder Admin-Recht erforderlich.
5. Enter phpMyAdmin für exakt diese Staging-Zeile öffnen. Datenbankname bestätigen
   und sicherstellen, dass noch keine Anwendungstabellen vorhanden sind.
6. Die eingecheckte Datei [hostinger-initial-schema.sql](../db/staging/hostinger-initial-schema.sql)
   herunterladen und in phpMyAdmin über Import → Datei auswählen → SQL importieren.
   Bei der ersten Fehlermeldung stoppen, keine Einstellung zum Ignorieren von
   Fehlern einschalten und keine erfolgreichen Teilschritte blind erneut ausführen.

Die Datei setzt ausdrücklich USE `u874339379_findmyduptest`, enthält unverändert
001_catalog.sql sowie schema_migrations und genau einen Metadaten-Eintrag mit
Dateiprüfsumme. Sie legt neun leere Katalog-/Import-/Historientabellen an, keine
Produkte, Händler, Preise oder Affiliate-Links. Sie erstellt keine Benutzer und
ändert keine Rechte. CREATE TABLE ist absichtlich ohne IF NOT EXISTS, damit ein
bestehendes/teilweise angelegtes Schema nicht verdeckt wird. MySQL-DDL ist nicht
atomar. Bei Fehlern Rechte nicht erhöht lassen; Bestand/Sicherung prüfen und
kontrollierte Wiederherstellung mit Hostinger klären. Kein Produktionszugriff.

**Alternative zum einmaligen phpMyAdmin-Import:** In einem vertrauenswürdigen
Wartungsumfeld mit vollständigem Repository, Node 22.13+ und npm ci --include=dev
kann der bestehende Migrationsrunner verwendet werden. Nicht beide Wege anwenden.
Privat konfigurieren:

```dotenv
DEPLOYMENT_ENV=staging
MYSQL_DATABASE=u874339379_findmyduptest
MYSQL_MIGRATION_USER=u874339379_findmyduptest
MYSQL_MIGRATION_PASSWORD=   # privates Wartungspasswort, nicht in git
DATABASE_ACCESS_ENABLED=true
DB_MIGRATIONS_ENABLED=true
CATALOG_SEARCH_ENABLED=false
AWIN_IMPORT_ENABLED=false
IMAGE_SEARCH_ENABLED=false
DB_CONNECTION_TEST_ENABLED=false
```

Dazu den bestätigten DB-Host, Port und TLS setzen. Dann ausschließlich dort:

```sh
npm run db:migrate -- --confirm
```

Kein Migrationsaufruf beim Build/Start und keine privilegierten Credentials in der
Web-App. Hostinger dokumentiert, dass npm auf Business nicht über SSH verfügbar
ist. Für externe Wartung nur gezielt freigegebenen Staging-Zugang mit IP-Limit und
verifiziertem Remote-TLS verwenden. Ist das nicht möglich, den phpMyAdmin-Weg
nutzen oder mit Support einen sicheren Wartungszugang klären. Spätere Versionen
mit dem Runner anwenden; die Initial-SQL-Datei nie erneut oder für Updates nutzen.

## 6. Stufe 2: dasselbe Konto auf SELECT begrenzen und API prüfen

1. Wartungsverbindungen/phpMyAdmin-Sitzungen schließen. Wartungsflags deaktivieren
   und die Wartungs-Credentials aus dem privaten Prozess entfernen.
2. hPanel → Databases → Management → Staging-Zeile → ⋮ → Change Permissions.
   Nur SELECT angehakt lassen, alle anderen Rechte entfernen, Update. USAGE kann
   intern weiterhin erscheinen; das ist kein Schreibrecht. Das Konto darf keine
   Rechte auf anderen Datenbanken, globale SELECT-Rechte oder GRANT OPTION haben.
3. Über Change Password ein neues Laufzeitpasswort setzen. Das Wartungspasswort
   nicht in die Web-App übernehmen. Die Rolle bleibt dasselbe MySQL-Konto.
4. Erst jetzt die DB-Werte aus Abschnitt 4 und das Laufzeitpasswort privat in der
   Staging-App eintragen. DEPLOYMENT_ENV=staging setzen. Alle Migrations-/Import-
   Credential-Felder entfernen. Nur DATABASE_ACCESS_ENABLED und
   CATALOG_SEARCH_ENABLED nach Freigabe true setzen, die übrigen Flags false.
   In hPanel die Staging-App neu starten, damit frische Verbindungen verwendet werden.
5. Auf der Staging-Vorschau GET `/api/products/search/?q=tasche` aufrufen.
   Erwartet: HTTP 200, source=catalog und offers=[]. Keine Demo-Daten in der DB.

Die Next.js-Such-API prüft bei DEPLOYMENT_ENV=staging vor jeder Katalogabfrage
SHOW GRANTS FOR CURRENT_USER. Nur SELECT/USAGE auf dem Staging-Ziel sind zulässig.
Verbliebene Schreib-/Schemarechte, nicht prüfbare Grants und ein Produktionsziel
führen zu einer allgemeinen 503-Antwort CATALOG_UNAVAILABLE. Keine rohen Grants,
SQL-Fehler oder Credentials gelangen zur Antwort. HTTP 200 bestätigt somit auch
die SELECT-only-Prüfung aus dem tatsächlichen Next.js-Prozess. Ungültiges q=x
muss 400 liefern; POST /api/image-search/ bleibt 503. Kein öffentlicher Schreibtest.

Optional zusätzlich in einem privaten Wartungsumfeld mit den neuen SELECT-only-
Zugangsdaten, DATABASE_ACCESS_ENABLED=true, DB_CONNECTION_TEST_ENABLED=true,
DEPLOYMENT_ENV=staging und allen Schreib-/Bildflags false:

```sh
npm run db:check -- --confirm --database=u874339379_findmyduptest --schema
```

Erwartet: connection=ok, version=supported, privileges=read-only, schema=verified.
Der CLI-Test führt ausschließlich SELECT/SHOW aus und vergleicht die Historie mit
Migrationsdateien. Keine DDL/DML-Rechte werden durch Test-Schreibversuche geprüft.
Nach Abschluss Diagnoseflag wieder false setzen und den Wartungsprozess schließen.

Die UI verwendet weiterhin gekennzeichnete Demo-Produkte. API-Aktivierung allein
schaltet die sichtbare Suche nicht auf echte Angebote um. Die Tests, die absichtlich
Schreibzugriffe versuchen oder Fixtures importieren, laufen ausschließlich in CI.
Sie dürfen nie mit Hostinger-Credentials gestartet werden.

## 7. Spätere Awin-Importe mit nur einem Benutzer

Jetzt keine Imports aktivieren. Ein gemeinsames Konto erlaubt keine gleichzeitig
privilegierte Importverbindung und nachweislich SELECT-only-Webverbindung.
Ein unbeaufsichtigter Import mit dauerhaftem Schreibrecht ist deshalb nicht der
vorbereitete Betriebsmodus. Später, nur nach separater Importfreigabe:

1. Staging-Katalogzugriff deaktivieren, Passwort aus der Web-App entfernen und
   die App neu starten. Die Oberfläche bleibt nutzbar, die Katalog-API meldet 503.
2. Konto auf ein privates Wartungspasswort umstellen und temporär SELECT, INSERT,
   UPDATE und DELETE auf dieser DB gewähren. Kein CREATE, ALTER, DROP oder GRANT
   OPTION. DELETE ist für den Ersatz von product_images im bestehenden Importer nötig.
3. Nur im isolierten Importprozess denselben Benutzer explizit als MYSQL_IMPORT_USER
   und das Wartungspasswort als MYSQL_IMPORT_PASSWORD setzen. Dort ausschließlich
   DATABASE_ACCESS_ENABLED und AWIN_IMPORT_ENABLED aktivieren. Keine Import-
   Variablen, privaten Feed-URLs oder Tokens im öffentlichen Web-Prozess belassen.
4. Erst freigegebene Händler/Kategorien und Quellen prüfen, dann einen genehmigten,
   begrenzten echten Feed-Batch importieren. Keine Demo-Fixtures. Der aktuelle
   Importer lädt selbst keinen Feed herunter und besitzt keinen Scheduler.
5. Auch bei Fehlschlag Verbindungen schließen, Schreibrechte entziehen, nur SELECT
   behalten, Importflag deaktivieren, Credentials entfernen und ein neues
   Laufzeitpasswort setzen. Danach CLI/API-Prüfung aus Stufe 2 und erst bei Erfolg
   den Katalogzugriff wieder freigeben. Bei unklarer Rechtebereinigung deaktiviert lassen.

Dasselbe Vorgehen gilt für spätere Schemaänderungen, mit den konkret dafür
geprüften DDL-Rechten. Die Wahl der Env-Präfixe ändert die Datenbankrechte nicht.
Für kontinuierliche Imports ohne Wartungsfenster wäre später eine echte Trennung
von MySQL-Konten/Privilegien erforderlich. Diese Vorbereitung benötigt keinen
neuen kostenpflichtigen Dienst. OpenAI bleibt unabhängig davon deaktiviert.

## 8. Produktionsfreigabe und Rückweg

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
[Hostinger MySQL und Neustart nach Env-Änderungen](https://www.hostinger.com/support/connecting-a-hostinger-mysql-database-to-a-node-js-application/),
[Hostinger Benutzerrechte ändern](https://www.hostinger.com/support/4564363-how-to-change-permissions-for-a-database-user-in-hostinger/),
[Hostinger: ein Benutzer je Datenbank](https://www.hostinger.com/support/1583542-how-to-create-a-new-mysql-database-in-hostinger/).
