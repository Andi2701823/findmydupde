export const metadata = { title: "Datenschutz im Prototyp" };
export default function Privacy() {
  return (
    <main id="main" className="shell legal-page">
      <span className="eyebrow">TRANSPARENT VON ANFANG AN</span>
      <h1>Datenschutz im Prototyp</h1>
      <p className="notice">
        Diese Seite beschreibt die Funktionen der Demo. Vor einem öffentlichen
        Produktstart muss eine vollständige Datenschutzerklärung mit
        Betreiberangaben und den tatsächlich eingesetzten Diensten erstellt
        werden.
      </p>
      <h2>Ausgewählte Bilder</h2>
      <p>
        Die Bildvorschau wird lokal in deinem Browser erzeugt. Die Anwendung
        sendet die Bilder an keinen Server und speichert sie nicht dauerhaft.
        Beim Entfernen des Bildes oder Verlassen der Suche wird die Vorschau
        freigegeben.
      </p>
      <h2>Suche und Merkliste</h2>
      <p>
        Die Suche arbeitet mit dem mitgelieferten Demo-Katalog. Suchbegriffe
        stehen in der URL, damit Ergebnisse direkt aufrufbar sind. Sie können
        dadurch im Browserverlauf und in Hosting-Protokollen erscheinen. Gib
        keine persönlichen oder vertraulichen Angaben ein.
      </p>
      <p>
        Wenn du ein Produkt merkst, speichert der Browser seine Demo-ID im
        lokalen Speicher unter „findmydup:favorites“. Es gibt kein Konto und
        keine Übertragung der Merkliste. Entferne die Einträge mit dem
        Herzsymbol oder lösche die Website-Daten im Browser.
      </p>
      <h2>Externe Dienste</h2>
      <p>
        Diese Anwendung lädt keine externen Schriftarten oder Produktbilder und
        bindet keine Analyse- oder Werbedienste ein. OpenAI, Supabase und Awin
        sind in dieser Version nicht verbunden.
      </p>
      <h2>Hosting und spätere Funktionen</h2>
      <p>
        Beim Hosting können technische Zugriffsdaten verarbeitet werden.
        Betreiber, Hosting-Konfiguration, Rechtsgrundlagen,
        Aufbewahrungsfristen, Kontakt und Betroffenenrechte müssen vor dem
        öffentlichen Start ergänzt werden. Eine spätere Bildanalyse oder
        Affiliate-Anbindung benötigt eine aktualisierte Datenschutzerklärung und
        passende Schutzmaßnahmen.
      </p>
    </main>
  );
}
