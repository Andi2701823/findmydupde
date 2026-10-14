import Link from "next/link";
import type { Metadata } from "next";
export const metadata: Metadata = {title:"Für Händler & Marken",description:"Informationen zur Zusammenarbeit mit FindMyDup, einer deutschsprachigen Einkaufsratgeber- und Produktentdeckungswebsite."};
export default function PartnerPage(){return <main id="main" className="shell legal-page">
  <span className="eyebrow">FÜR HÄNDLER UND MARKEN</span>
  <h1>Produkte verständlich und transparent präsentieren.</h1>
  <p>FindMyDup ist eine deutschsprachige Informationsplattform für Menschen, die bewusst einkaufen. Unsere Schwerpunkte sind Mode, Beauty, Wohnen und Technik. Wir veröffentlichen Ratgeber, die beim Einordnen von Produkteigenschaften und Kaufentscheidungen helfen.</p>
  <h2>Unser Ansatz</h2>
  <ul>
    <li><strong>Relevante Themen:</strong> Inhaltsstoffe, Materialien, technische Merkmale, Nutzung und Kosten verständlich erklären.</li>
    <li><strong>Klare Trennung:</strong> Redaktionelle Ratgeber bleiben von werblichen Partnerangeboten unterscheidbar.</li>
    <li><strong>Transparente Händlerlinks:</strong> Affiliate-Verweise werden, sobald verwendet, deutlich gekennzeichnet; Preis und Verfügbarkeit stammen vom jeweiligen Händler.</li>
  </ul>
  <h2>Affiliate-Partnerschaften</h2>
  <p>Wir prüfen Kooperationen über Affiliate-Netzwerke, darunter Awin. Produktdaten, Bilder und Händlerlinks nutzen wir nur im Rahmen bestehender Freigaben und der jeweils geltenden Programmbedingungen. Wir machen keine unbelegten Angaben zu Reichweite, Verkäufen oder Produktgleichwertigkeit.</p>
  <h2>Kontakt für Kooperationen</h2>
  <p>Sie möchten mögliche Formen der Zusammenarbeit besprechen? Kontaktieren Sie uns unter <a href="mailto:andreas.paul4282@gmail.com?subject=Partnerschaft%20FindMyDup">andreas.paul4282@gmail.com</a>. Weitere Betreiberangaben stehen im <Link href="/impressum/">Impressum</Link>.</p>
  <Link href="/ratgeber/" className="button secondary">Unsere Inhalte ansehen</Link>
</main>;}
