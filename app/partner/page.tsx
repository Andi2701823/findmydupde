import {supportEmail} from "@/lib/site-contact";
import Link from "next/link";
import type { Metadata } from "next";
export const metadata: Metadata = {title:"Für Händler & Marken",description:"Zusammenarbeit und Affiliate-Partnerschaften mit FindMyDup: transparent präsentierte Händlerangebote und unabhängige Einkaufshilfen.",alternates:{canonical:"https://findmydup.de/partner/"}};
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
  <p>Wir arbeiten über Awin mit freigegebenen Partnern zusammen. Auf unserer Beauty-Produktseite zeigen wir derzeit Produkte von bdr-beauty DE mit gekennzeichneten Affiliate-Links. Produktdaten, Bilder und Händlerlinks nutzen wir nur im Rahmen bestehender Freigaben und der jeweils geltenden Programmbedingungen. Wir machen keine unbelegten Angaben zu Reichweite, Verkäufen oder Produktgleichwertigkeit.</p>
  <h2>Kontakt für Kooperationen</h2>
  <p>Sie möchten mögliche Formen der Zusammenarbeit besprechen? Kontaktieren Sie uns unter <a href={"mailto:"+supportEmail+"?subject=Partnerschaft%20FindMyDup"}>{supportEmail}</a>. Weitere Betreiberangaben stehen im <Link href="/impressum/">Impressum</Link>.</p>
  <Link href="/ratgeber/" className="button secondary">Unsere Inhalte ansehen</Link>
</main>;}
