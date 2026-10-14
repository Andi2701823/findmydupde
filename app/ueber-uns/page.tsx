import Link from "next/link";
import type { Metadata } from "next";
import { stagingLiveCatalogEnabled } from "@/server/catalog/live-mode.ts";

export const metadata: Metadata = {
  title: "Über FindMyDup",
  description: "FindMyDup entwickelt eine transparente Produktsuche für ähnliche, preisbewusste Alternativen. Erfahre, welche Funktionen schon verfügbar sind und was als Nächstes kommt.",
};
export const dynamic = "force-dynamic";

export default function AboutPage() {
  const live = stagingLiveCatalogEnabled();
  return (
    <main id="main" className="shell legal-page about-page">
      <span className="eyebrow">ÜBER FINDMYDUP</span>
      <h1>Entdecken statt zu viel bezahlen.</h1>
      <p>
        FindMyDup entsteht aus einer einfachen Idee: Wer ein schönes Produkt
        entdeckt, soll weitere Angebote vergleichen können, ohne jeden Shop
        einzeln durchsuchen zu müssen.
      </p>
      <p>
        Unser Ziel ist eine Produktsuche für ähnliche Artikel aus Mode,
        Beauty, Wohnen und Technik. Wir möchten Titel, Produktbilder,
        Händlerpreise und den Zeitpunkt der Preisbeobachtung möglichst klar
        darstellen. Ähnliche Optik ist dabei keine Garantie für identische
        Qualität, Material oder Funktion.
      </p>
      <h2>So funktioniert FindMyDup</h2>
      <ul>
        <li>
          <strong>Produktname eingeben:</strong>{" "}
          {live
            ? "Die Textsuche fragt unseren echten Produktkatalog ab. Partnerangebote erscheinen erst, wenn sie uns zur Veröffentlichung zur Verfügung stehen."
            : "Die derzeitige Textsuche demonstriert den Ablauf mit ausdrücklich fiktiven Beispielen."}
        </li>
        <li>
          <strong>Foto auswählen:</strong> Bilder lassen sich aktuell lokal
          im Browser ansehen. Eine KI-Bilderkennung oder ein automatischer
          Produktabgleich findet noch nicht statt.
        </li>
        <li>
          <strong>Angebote prüfen:</strong> Sobald autorisierte Händlerdaten
          eingebunden sind, zeigen wir Shop, Preis und Aktualität.
          Preise und Verfügbarkeit sind beim Händler maßgeblich.
        </li>
      </ul>
      <h2>Unabhängig und nachvollziehbar</h2>
      <p>
        FindMyDup verkauft selbst keine Produkte. Zukünftige Produktlinks
        können Affiliate-Links sein. Wenn ein Kauf über solche Links zustande
        kommt, kann FindMyDup eine Provision erhalten. Für Nutzer entstehen
        dadurch nicht automatisch zusätzliche Kosten. Etwaige Werbe- und
        Affiliate-Verlinkungen werden entsprechend gekennzeichnet.
      </p>
      <h2>Entwicklung und Partnerschaften</h2>
      <p>
        FindMyDup wird aktuell schrittweise aufgebaut. Händlerangebote werden
        nicht erfunden; eine Aufnahme in den Produktkatalog setzt eine
        entsprechend berechtigte Datenquelle voraus. Wir veröffentlichen
        keine ungeprüften Preisvorteile oder pauschalen Gleichwertigkeitsversprechen.
      </p>
      <p>
        Die Produktdatenanbindung und die spätere Bilderkennung werden
        nacheinander ausgebaut. Bis zur Freigabe dieser Funktionen bleibt
        die entsprechende Kennzeichnung als Test- oder Demoversion sichtbar.
      </p>
      <Link className="button secondary" href="/suche/">
        Suche ansehen
      </Link>
    </main>
  );
}
