import type { Metadata } from "next";
import { stagingLiveCatalogEnabled } from "@/server/catalog/live-mode.ts";

export const metadata: Metadata = {
  title: "Datenschutzhinweise",
  description: "Informationen zur Verarbeitung personenbezogener Daten bei FindMyDup.",
};
export const dynamic = "force-dynamic";

export default function Privacy() {
  const liveCatalog = stagingLiveCatalogEnabled();
  return (
    <main id="main" className="shell legal-page">
      <span className="eyebrow">DATENSCHUTZ</span>
      <h1>Datenschutzhinweise</h1>
      <p className="notice">
        FindMyDup befindet sich im Testbetrieb. Diese Hinweise beschreiben
        die derzeit implementierten Funktionen. Vor einer öffentlichen
        Freigabe müssen insbesondere Aufbewahrungsfristen, Verträge mit
        Dienstleistern und die tatsächliche Hosting-Konfiguration abschließend
        überprüft werden.
      </p>

      <h2>1. Verantwortlicher</h2>
      <p>
        Andreas Paul
        <br />
        Germersheimer Straße 17
        <br />
        70499 Stuttgart
        <br />
        Deutschland
        <br />
        E-Mail:{" "}
        <a href="mailto:andreas.paul4282@gmail.com">
          andreas.paul4282@gmail.com
        </a>
      </p>

      <h2>2. Besuch der Website und Hosting</h2>
      <p>
        Die Website wird bei Hostinger bereitgestellt. Beim Abruf einer
        Website werden technisch erforderliche Informationen wie IP-Adresse,
        Zeitpunkt des Zugriffs, angeforderte Adresse, Browserdaten und
        Fehlerstatus verarbeitet, damit die Website bereitgestellt und
        geschützt werden kann. Rechtsgrundlage ist grundsätzlich Art. 6
        Abs. 1 lit. f DSGVO (sicherer und zuverlässiger Betrieb).
        Die tatsächlichen Speicherdauern der Hostinger-Protokolle und
        etwaige weitere Empfänger werden vor der öffentlichen Freigabe geprüft.
      </p>

      <h2>3. Produktsuche und Supabase</h2>
      <p>
        {liveCatalog
          ? "Bei der Textsuche wird der Suchbegriff an unseren Server übermittelt und von dort für die Abfrage der Produktdatenbank an Supabase weitergegeben. Die Datenbank für den Testbetrieb liegt in der EU-Region Frankfurt. Suchbegriffe stehen auch in der Seitenadresse und können deshalb im Browserverlauf und in Serverprotokollen erscheinen."
          : "Die aktuelle Demo-Suche arbeitet mit lokal eingebundenen Beispielprodukten. Suchbegriffe stehen in der Seitenadresse und können deshalb im Browserverlauf und in Serverprotokollen erscheinen. Für den geschützten Supabase-Testbetrieb ist eine serverseitige Abfrage vorgesehen."}
      </p>
      <p>
        Bitte gib in der Produktsuche keine persönlichen oder vertraulichen
        Daten ein. Soweit die serverseitige Produktsuche aktiviert ist,
        verwenden wir die eingegebenen Suchbegriffe zur Bereitstellung der
        angeforderten Suchergebnisse (Art. 6 Abs. 1 lit. f DSGVO).
        Die Verarbeitung und Speicherung technischer Verbindungsdaten durch
        Supabase muss anhand des abgeschlossenen Vertrags und der tatsächlichen
        Konfiguration zusätzlich geprüft werden.
      </p>

      <h2>4. Foto-Vorschau</h2>
      <p>
        Ausgewählte Bilder werden derzeit nur lokal im Browser für eine
        Vorschau verarbeitet. Sie werden nicht für eine KI-Bildsuche
        hochgeladen und nicht an unseren Server übermittelt. Eine künftige
        Bildanalyse erfordert vor Aktivierung aktualisierte Hinweise.
      </p>

      <h2>5. Merkliste und lokaler Speicher</h2>
      <p>
        Die Merkliste wird unter dem Schlüssel „findmydup:favorites“
        lokal in deinem Browser gespeichert, damit du die Auswahl auch
        beim nächsten Besuch wiederfindest. Eine Nutzerregistrierung
        findet dafür nicht statt. Du kannst einzelne Favoriten entfernen
        oder die Website-Daten deines Browsers löschen. Diese Speicherung
        dient allein der ausdrücklich genutzten Merkfunktion.
      </p>

      <h2>6. Produktbilder und Links zu Händlern</h2>
      <p>
        Die derzeit gezeigten Beispielgrafiken werden von dieser Website
        ausgeliefert. Sobald genehmigte Händlerangebote erscheinen,
        können Produktbilder von externen Bildservern geladen werden;
        dabei können technische Verbindungsdaten an die jeweiligen
        Bildanbieter übermittelt werden. Beim freiwilligen Öffnen eines
        externen Shop- oder Affiliate-Links gelten zusätzlich die
        Datenschutzhinweise des jeweiligen Anbieters. Externe
        Produktbilder und Affiliate-Links dürfen erst nach Prüfung und
        entsprechender Ergänzung dieser Hinweise freigeschaltet werden.
      </p>

      <h2>7. Kontaktaufnahme</h2>
      <p>
        Wenn du uns per E-Mail kontaktierst, verarbeiten wir die von
        dir mitgeteilten Daten ausschließlich zur Bearbeitung deiner
        Anfrage. Rechtsgrundlage ist je nach Anliegen Art. 6 Abs. 1
        lit. b oder lit. f DSGVO. Die Daten werden gelöscht, sobald
        sie für diesen Zweck nicht mehr benötigt werden, soweit keine
        gesetzlichen Aufbewahrungspflichten entgegenstehen.
      </p>

      <h2>8. Deine Datenschutzrechte</h2>
      <p>
        Du kannst im Rahmen der gesetzlichen Voraussetzungen Auskunft
        (Art. 15 DSGVO), Berichtigung (Art. 16), Löschung (Art. 17),
        Einschränkung (Art. 18), Datenübertragbarkeit (Art. 20) und
        Widerspruch (Art. 21) verlangen. Außerdem kannst du dich bei
        einer zuständigen Datenschutzaufsichtsbehörde beschweren
        (Art. 77 DSGVO). Für Fragen und Anfragen nutze bitte die
        oben genannte E-Mail-Adresse.
      </p>
    </main>
  );
}
