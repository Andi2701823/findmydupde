import type {Metadata} from "next";
import Link from "next/link";
import {funnelcockpit as product} from "@/lib/digital-tools";
export const metadata:Metadata={
 title:"FunnelCockpit: Funktionen, Preise und Abo-Kosten",
 description:"FunnelCockpit im Überblick: Funnels, Website-Builder, Marketing-Funktionen, Testphase und monatliche Kosten. Transparente Informationen und Werbelink.",
 alternates:{canonical:"https://findmydup.de/digitale-tools/funnelcockpit/"}
};
function AffiliateButton({children}:{children:React.ReactNode}){
 return <a href={product.affiliateUrl} className="button primary" target="_blank"
 rel="sponsored nofollow noopener noreferrer">{children}</a>;
}
export default function FunnelCockpitPage(){
 return <main id="main" className="shell affiliate-page digital-tool-detail">
  <nav className="breadcrumb" aria-label="Brotkrumennavigation">
   <Link href="/">Startseite</Link><span>/</span><Link href="/digitale-tools/">Digitale Tools</Link><span>/</span>FunnelCockpit
  </nav>
  <span className="eyebrow">DIGITALES PRODUKT · MARKETING-SOFTWARE</span>
  <h1>FunnelCockpit: Funktionen, Kosten und Einsatzmöglichkeiten</h1>
  <p className="affiliate-intro">FunnelCockpit bündelt Werkzeuge für Websites, Verkaufsfunnels und Marketing in einer browserbasierten Plattform. Hier findest du eine sachliche Einordnung der veröffentlichten Funktionen und Tarifbedingungen.</p>
  <aside className="affiliate-disclosure-box">
   <strong>Werbung / Affiliate-Hinweis</strong>
   <p>Die Schaltflächen zu FunnelCockpit verwenden einen Digistore24-Partnerlink. Wenn du darüber ein Abo abschließt, können wir eine Provision erhalten. Dies ist kein eigener Praxistest; Informationen stammen von der offiziellen Anbieterwebsite (Stand: Oktober 2026).</p>
  </aside>
  <div className="digital-tool-lead">
   <div><span className="eyebrow">ALL-IN-ONE-PLATTFORM</span>
    <h2>Für Websites, Funnels und Online-Marketing.</h2>
    <p>Die Plattform eignet sich besonders für Menschen und Unternehmen, die Landingpages, Verkaufsprozesse und digitale Angebote an einem Ort verwalten möchten.</p>
    <div className="digital-tool-actions"><AffiliateButton>FunnelCockpit beim Anbieter ansehen ↗</AffiliateButton><a className="button secondary" href={product.pricingUrl} target="_blank" rel="noopener noreferrer">Offizielle Tarife prüfen ↗</a></div>
   </div>
   <div className="digital-tool-lead-facts">
    <span>Software-Abonnement</span><strong>14 Tage für 1 €</strong>
    <p>Danach laut aktueller Preisseite regulär ab 47 €/Monat bei monatlicher Zahlung. Vor Abschluss den gewählten Tarif und alle Vertragsbedingungen prüfen.</p>
   </div>
  </div>
  <section className="digital-tool-section" aria-labelledby="functions">
   <h2 id="functions">Was bietet FunnelCockpit?</h2>
   <ul>
    <li><strong>Website- und Funnel-Builder:</strong> Seiten und Verkaufsstrecken erstellen.</li>
    <li><strong>Mitgliederbereiche:</strong> Zugänge und geschützte Inhalte verwalten, Umfang abhängig vom Tarif.</li>
    <li><strong>Marketing-Funktionen:</strong> Unter anderem Formulare, Splittests und Werkzeuge für Kampagnen.</li>
    <li><strong>KI-Funktionen:</strong> Laut Anbieter beispielsweise AI PageBuilder und AI Agents mit tarifabhängigen Credits.</li>
   </ul>
   <p>Welche Funktionen enthalten sind, hängt vom Tarif ab. Einige Funktionen wie CRM stehen nicht im Lite-Tarif bereit.</p>
  </section>
  <section className="digital-tool-section" aria-labelledby="prices">
   <h2 id="prices">Was kostet FunnelCockpit?</h2>
   <p>Die folgenden Preise veröffentlicht der Anbieter für monatliche Zahlung. Eine jährliche Abrechnung kann andere Konditionen haben.</p>
   <div className="digital-price-grid">
    <div><strong>Lite</strong><span>47 € / Monat</span><p>Für den Einstieg, laut Anbieter 5 Projekte und 1 Mitgliederbereich.</p></div>
    <div><strong>Standard</strong><span>97 € / Monat</span><p>Für größere Vorhaben, laut Anbieter 10 Projekte und 3 Mitgliederbereiche.</p></div>
    <div><strong>Business</strong><span>297 € / Monat</span><p>Für umfangreichere Projekte, laut Anbieter 50 Projekte und zusätzliche Team-Funktionen.</p></div>
   </div>
   <p><strong>Wichtig:</strong> Die Testphase kostet laut Anbieter 1 € für 14 Tage. Anschließend läuft das gewählte kostenpflichtige Abonnement weiter, sofern es nicht rechtzeitig gekündigt wird. Preise und Bedingungen im Bestellprozess können abweichen. <a href={product.pricingUrl} target="_blank" rel="noopener noreferrer">Aktuelle Tarife direkt prüfen ↗</a></p>
  </section>
  <section className="digital-tool-section" aria-labelledby="assessment">
   <h2 id="assessment">Für wen kann sich das Tool lohnen?</h2>
   <p>Für Selbstständige, Agenturen und Betreiber digitaler Angebote, die mehrere Marketing-Werkzeuge in einer Plattform bündeln möchten. Weniger passend ist ein kostenpflichtiges All-in-One-Abo, wenn du nur eine einzelne einfache Website brauchst und die zusätzlichen Funktionen nicht nutzt.</p>
   <p>Vor einem Abo lohnt es sich, den tatsächlich benötigten Funktionsumfang und die laufenden Kosten mit anderen Lösungen zu vergleichen.</p>
  </section>
  <div className="digital-tool-bottom">
   <strong>FunnelCockpit genauer ansehen?</strong>
   <p>Informiere dich auf der offiziellen Website über Leistungsumfang, Kündigung und endgültige Preise.</p>
   <AffiliateButton>Zur FunnelCockpit-Verkaufsseite ↗</AffiliateButton>
   <p className="affiliate-disclosure">Werbelink über Digistore24. Kein eigener Softwaretest.</p>
  </div>
 </main>;
}
