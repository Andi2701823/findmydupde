import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Für Händler und Marken",
  description: "Erfahren Sie, wie FindMyDup Produktentdeckung und transparente Händlerangebote zusammenbringen möchte.",
};

export default function PartnerPage() {
  return (
    <main id="main" className="shell legal-page">
      <span className="eyebrow">FÜR HÄNDLER UND MARKEN</span>
      <h1>Ihre Produkte. Dort, wo Menschen nach Alternativen suchen.</h1>
      <p>
        FindMyDup ist eine unabhängige, deutschsprachige Plattform im Aufbau.
        Unser Ziel ist es, Besucherinnen und Besuchern passende Produktangebote
        aus verschiedenen Shops zugänglich zu machen. Wir beginnen mit Mode,
        Beauty, Wohnen und Technik.
      </p>

      <h2>So möchten wir Partnerprodukte präsentieren</h2>
      <ul>
        <li>
          <strong>Produktsuche:</strong> Nutzer suchen nach einem Produktnamen
          und können künftig nach Preis, Kategorie und weiteren Merkmalen filtern.
        </li>
        <li>
          <strong>Transparente Angebote:</strong> Produktbild, Händlername,
          Preis und Zeitpunkt der Preisbeobachtung sollen klar erkennbar sein.
          Bei Preisen und Verfügbarkeit sind die Angaben des Händlers maßgeblich.
        </li>
        <li>
          <strong>Weiterleitung zum Händler:</strong> FindMyDup verkauft keine
          Waren selbst. Käufe werden gegebenenfalls auf der Website des
          jeweiligen Händlers abgeschlossen.
        </li>
      </ul>

      <h2>Affiliate-Partnerschaften</h2>
      <p>
        Wir möchten autorisierte Produktdatenfeeds von geeigneten Händlern
        einsetzen und können bei einer entsprechenden Vereinbarung
        provisionsbasierte Affiliate-Links verwenden. Solche Links
        werden gekennzeichnet. Wir veröffentlichen keine erfundenen
        Händlerangebote, irreführenden Preisvergleiche oder Aussagen über
        Produktgleichwertigkeit, die wir nicht belegen können.
      </p>

      <h2>Aktueller Projektstand</h2>
      <p>
        Die Website und die serverseitige Katalogsuche befinden sich im
        Testbetrieb. Der Produktkatalog wird erst mit freigegebenen
        Partnerangeboten befüllt. Die Fotoauswahl ist zurzeit eine
        gekennzeichnete Vorschau; eine automatische KI-Bilderkennung
        ist noch nicht aktiviert. Wir können aktuell keine
        Besucher- oder Conversion-Zahlen zusichern.
      </p>

      <h2>Zusammenarbeit anfragen</h2>
      <p>
        Sie betreiben einen Shop oder vertreten eine Marke und möchten
        über eine mögliche Einbindung sprechen? Kontaktieren Sie uns unter{" "}
        <a href="mailto:andreas.paul4282@gmail.com?subject=Partnerschaft%20FindMyDup">
          andreas.paul4282@gmail.com
        </a>.
        Ansprechpartner und vollständige Anbieterangaben finden Sie
        im <Link href="/impressum/">Impressum</Link>.
      </p>

      <Link href="/ueber-uns/" className="button secondary">
        Mehr über FindMyDup
      </Link>
    </main>
  );
}
