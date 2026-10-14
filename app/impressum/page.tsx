import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Impressum",
  description: "Anbieterkennzeichnung und Kontakt für FindMyDup.",
};

export default function Imprint() {
  return (
    <main id="main" className="shell legal-page">
      <span className="eyebrow">ANBIETERKENNZEICHNUNG</span>
      <h1>Impressum</h1>

      <h2>Angaben gemäß § 5 DDG</h2>
      <p>
        Andreas Paul
        <br />
        Germersheimer Straße 17
        <br />
        70499 Stuttgart
        <br />
        Deutschland
      </p>

      <h2>Kontakt</h2>
      <p>
        E-Mail:{" "}
        <a href="mailto:andreas.paul4282@gmail.com">
          andreas.paul4282@gmail.com
        </a>
      </p>

      <h2>Über dieses Angebot</h2>
      <p>
        FindMyDup ist eine Plattform in Entwicklung, die die Suche nach
        vergleichbaren Produkten und Händlerangeboten erleichtern soll.
        FindMyDup ist selbst kein Verkäufer der angezeigten Produkte.
        Alle Bestellungen und Vertragsabschlüsse erfolgen gegebenenfalls
        direkt beim jeweiligen Händler.
      </p>

      <p>
        Affiliate-Verlinkungen werden entsprechend gekennzeichnet,
        sobald die Funktion mit autorisierten Partnern eingesetzt wird.
        Derzeit gezeigte Beispielprodukte und Beispielpreise sind als
        solche kenntlich gemacht.
      </p>
    </main>
  );
}
