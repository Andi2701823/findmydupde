import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Produkte sinnvoll vergleichen",
  description: "Praktischer Ratgeber: Worauf du beim Vergleich von Mode, Beauty, Möbeln und Technik achten solltest.",
};

export default function GuidePage() {
  return (
    <main id="main" className="shell legal-page">
      <span className="eyebrow">FINDMYDUP RATGEBER</span>
      <h1>Produkte vergleichen: Worauf es wirklich ankommt</h1>
      <p>
        Zwei Produkte können beinahe gleich aussehen und sich trotzdem stark
        unterscheiden. Die Farbe passt, das Foto überzeugt, der Preis ist
        niedriger. Aber ist das Angebot auch die bessere Wahl? Mit ein paar
        gezielten Fragen lässt sich ein Vergleich leichter einordnen.
      </p>

      <h2>1. Nicht nur den Preis ansehen</h2>
      <p>
        Vergleiche zuerst, was du tatsächlich bekommst. Größe, Menge,
        Material, Lieferumfang, Versandkosten und Rückgabebedingungen können
        den Unterschied ausmachen. Ein günstigerer Artikel ist nicht
        automatisch das bessere Angebot, wenn etwa Zubehör fehlt oder
        hohe Versandkosten hinzukommen.
      </p>

      <h2>2. Bei Mode auf Maße und Material achten</h2>
      <p>
        Ein ähnlicher Schnitt bedeutet noch keine vergleichbare Passform.
        Prüfe die Größentabelle des Shops, die genaue Materialzusammensetzung
        und Hinweise zur Pflege. Fotos zeigen oft einen Look, aber nicht,
        wie sich ein Stoff anfühlt oder nach dem Waschen verhält.
      </p>

      <h2>3. Beauty-Produkte nach Inhalt vergleichen</h2>
      <p>
        Ähnliche Verpackungen oder Farben sagen nichts darüber aus, ob
        Formulierung, Verträglichkeit oder Wirkung gleich sind. Achte auf
        Inhaltsstofflisten, Füllmenge, Anwendungshinweise und gegebenenfalls
        individuelle Unverträglichkeiten. Eine vergleichbare Optik
        ist kein Nachweis für gleichwertige Inhaltsstoffe.
      </p>

      <h2>4. Bei Möbeln und Technik die Details prüfen</h2>
      <p>
        Bei Möbeln sind Abmessungen, Belastbarkeit, Verarbeitung und
        Montage besonders wichtig. Bei Technik zählen dagegen häufig
        Anschlüsse, Kompatibilität, Akkulaufzeit und die vom Hersteller
        angegebenen Leistungsdaten. Lass dich nicht allein von einem
        ähnlichen Produktbild leiten.
      </p>

      <h2>5. Aktualität und Händlerinformationen beachten</h2>
      <p>
        Preise und Verfügbarkeiten können sich jederzeit ändern. Sieh
        nach, wann ein Preis zuletzt erfasst wurde, und prüfe das finale
        Angebot direkt beim Händler. Achte außerdem auf nachvollziehbare
        Kontaktangaben, Lieferzeiten und Rückgaberegeln des Shops.
      </p>

      <h2>Wie FindMyDup dabei helfen soll</h2>
      <p>
        FindMyDup entwickelt eine Produktsuche, die ähnliche Angebote
        nachvollziehbar darstellen soll. Dabei möchten wir Händler,
        Preise und die Aktualität der Angaben deutlich kennzeichnen.
        Die Textsuche befindet sich derzeit im Testbetrieb; es sind
        noch keine genehmigten Händlerfeeds veröffentlicht. Eine
        automatische Bilderkennung ist für später geplant.
      </p>
      <p>
        Wichtig: FindMyDup verkauft selbst keine Produkte und garantiert
        keine Gleichwertigkeit. Maßgeblich sind immer die aktuellen Angaben
        des jeweiligen Shops.
      </p>
      <Link href="/suche/" className="button secondary">
        Produktsuche ausprobieren
      </Link>
    </main>
  );
}
