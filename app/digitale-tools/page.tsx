import type {Metadata} from "next";
import Link from "next/link";
import {funnelcockpit} from "@/lib/digital-tools";
export const metadata:Metadata={
 title:"Digitale Tools für Marketing und Online-Business",
 description:"Digitale Software und Onlinedienste verständlich einordnen: Funktionen, Vertragsmodelle und transparente Partnerlinks.",
 alternates:{canonical:"https://findmydup.de/digitale-tools/"}
};
export default function DigitalToolsPage(){
 return <main id="main" className="shell affiliate-page digital-tools-page">
  <nav className="breadcrumb" aria-label="Brotkrumennavigation"><Link href="/">Startseite</Link><span>/</span> Digitale Tools</nav>
  <span className="eyebrow">SOFTWARE UND ONLINE-TOOLS</span>
  <h1>Digitale Tools entdecken.</h1>
  <p className="affiliate-intro">Nicht jedes Produkt ist ein Gegenstand. Hier findest du ausgewählte Software-Angebote mit verständlichen Informationen zu Funktionen, Preisen und laufenden Kosten.</p>
  <aside className="affiliate-disclosure-box"><strong>Transparenz</strong><p>Diese Seite enthält Werbung in Form von Affiliate-Links. Bei Abschluss über einen solchen Link können wir eine Provision erhalten. Wir haben die Software nicht selbst getestet. Angaben zu Preis, Testphase und Vertrag stammen vom Anbieter und können sich ändern.</p></aside>
  <section className="digital-tool-tile" aria-labelledby="funnelcockpit-tool-heading">
   <div className="digital-tool-mark" aria-hidden="true">FC</div>
   <div><span className="eyebrow">MARKETING-SOFTWARE · ABONNEMENT</span>
    <h2 id="funnelcockpit-tool-heading">{funnelcockpit.name}</h2>
    <p>{funnelcockpit.summary}</p>
    <p className="digital-tool-price">{funnelcockpit.priceContext}</p>
    <Link className="button primary" href={funnelcockpit.path}>Funktionen und Kosten ansehen →</Link>
   </div>
  </section>
 </main>;
}
