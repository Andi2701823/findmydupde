export const metadata = { title: "Impressum, Prototyp" };
export default function Imprint() {
  return (
    <main id="main" className="shell legal-page">
      <span className="eyebrow">FINDMYDUP DEMO</span>
      <h1>Impressum</h1>
      <p className="notice">
        Noch nicht für einen öffentlichen Produktstart ausgefüllt. Dies ist kein
        vollständiges Impressum.
      </p>
      <p>
        FindMyDup ist in dieser Version ein Entwicklungsprototyp mit erfundenen
        Produktbeispielen. Es gibt keine realen Shop-Angebote und keine
        Affiliate-Links.
      </p>
      <h2>Vor dem öffentlichen Start ergänzen</h2>
      <ul>
        <li>Vollständiger Name oder Firma des Betreibers</li>
        <li>Ladungsfähige Anschrift</li>
        <li>E-Mail-Adresse und weitere erforderliche Kontaktdaten</li>
        <li>Weitere Angaben, soweit sie für den Betreiber erforderlich sind</li>
      </ul>
      <p>
        Betreiberangaben werden hier bewusst nicht erfunden. Der Prototyp ist
        für Suchmaschinen auf „noindex“ gesetzt.
      </p>
    </main>
  );
}
