import type {Metadata} from "next";
import Image from "next/image";
import Link from "next/link";
import {funnelcockpit as product} from "@/lib/digital-tools";

export const metadata:Metadata={
 title:"FunnelCockpit 2026: Funktionen, Bilder, Preise & Erfahrungen",
 description:"Was kann FunnelCockpit? Software-Bilder, FunnelBuilder, E-Mail-Marketing, Mitgliederbereiche, ehrliche Einschätzung, Testphase und Abo-Kosten im Überblick.",
 alternates:{canonical:"https://findmydup.de/digitale-tools/funnelcockpit/"}
};

const screenshots={
 builder:"https://static.funnelcockpit.com/upload/8e03de11-7e44-488b-90c3-eab3f513d9e3.png",
 templates:"https://static.funnelcockpit.com/upload/RBQjxJBoixoW3jkEN/580cbfd8422d6f3773130e067efd7c7b.jpg",
 dashboard:"https://static.funnelcockpit.com/upload/4b8af1d4-40fe-4433-b53e-ff972d52329f.png"
} as const;

function AffiliateButton({children}:{children:React.ReactNode}){
 return <a href={product.affiliateUrl} className="button primary" target="_blank"
 rel="sponsored nofollow noopener noreferrer">{children}</a>;
}
function Screenshot({src,alt,caption,source,width=960,height=580}:{
 src:string;alt:string;caption:string;source:string;width?:number;height?:number;
}){
 return <figure className="digital-tool-screenshot">
  <div className="digital-tool-shot-image">
   <Image src={src} alt={alt} width={width} height={height} sizes="(max-width: 760px) 100vw, 620px" unoptimized loading="lazy"/>
  </div>
  <figcaption>{caption} <a href={source} target="_blank" rel="noopener noreferrer">Bildquelle: FunnelCockpit ↗</a></figcaption>
 </figure>;
}
export default function FunnelCockpitPage(){
 return <main id="main" className="shell affiliate-page digital-tool-detail">
  <nav className="breadcrumb" aria-label="Brotkrumennavigation">
   <Link href="/">Startseite</Link><span>/</span><Link href="/digitale-tools/">Digitale Tools</Link><span>/</span>FunnelCockpit
  </nav>
  <span className="eyebrow">DIGITALES PRODUKT · MARKETING-SOFTWARE · OKTOBER 2026</span>
  <h1>FunnelCockpit: Was kann die Software und was kostet sie?</h1>
  <p className="affiliate-intro">Landingpages bauen, Interessenten gewinnen, E-Mails versenden und einen Onlinekurs bereitstellen: Für solche Aufgaben bietet FunnelCockpit mehrere Werkzeuge unter einem Dach. Wir zeigen dir die wichtigsten Funktionen, echte Abbildungen des Anbieters, die aktuellen Tarife und Punkte, auf die du vor dem Abschluss achten solltest.</p>
  <aside className="affiliate-disclosure-box">
   <strong>Werbung / Transparenz</strong>
   <p>Diese Seite enthält Digistore24-Affiliate-Links. Bei einem Abschluss über diese Links können wir eine Provision erhalten. Dieser Überblick beruht auf den veröffentlichten Anbieterinformationen und Abbildungen, <strong>nicht auf einem eigenen Praxistest</strong>. Screenshots können von der heutigen Oberfläche abweichen.</p>
  </aside>

  <div className="digital-tool-lead digital-tool-visual-lead">
   <div className="digital-tool-hero-copy">
    <span className="eyebrow">EIN COCKPIT FÜR MEHRERE MARKETING-AUFGABEN</span>
    <h2>Weniger Tool-Wechsel, ein gemeinsamer Ablauf.</h2>
    <p>Du planst eine Website oder Verkaufsseite und möchtest danach Anmeldungen, E-Mail-Kontakte oder Kursinhalte verwalten? FunnelCockpit bietet dafür einen visuellen Seitenbaukasten und weitere Marketing-Funktionen. Du kannst klein anfangen, solltest aber prüfen, ob der Tarif deine benötigten Werkzeuge enthält.</p>
    <div className="digital-tool-highlight"><strong>14 Tage für 1 € testen</strong><span>Danach regulär ab 47 €/Monat bei monatlicher Abrechnung. Kein dauerhaft kostenloser Tarif.</span></div>
    <div className="digital-tool-actions">
     <AffiliateButton>FunnelCockpit ansehen ↗</AffiliateButton>
     <a className="button secondary" href={product.pricingUrl} target="_blank" rel="noopener noreferrer">Tarife beim Anbieter ↗</a>
    </div>
   </div>
   <Screenshot src={screenshots.builder} alt="Abbildung des visuellen FunnelCockpit-Seitenbaukastens mit auswählbaren Elementen wie Bildern und Buttons"
    caption="Anbieterabbildung zum visuellen Seitenbaukasten. Die Darstellung dient als Einblick in die Funktionen."
    source="https://funnelcockpit.com/" width={1000} height={650}/>
  </div>

  <nav className="digital-tool-toc" aria-label="Inhalt dieser Produktübersicht">
   <span>Direkt zu:</span>
   <a href="#so-funktionierts">So funktioniert es</a>
   <a href="#funktionen">Funktionen & Bilder</a>
   <a href="#preise">Preise & Laufzeit</a>
   <a href="#fuer-wen">Für wen?</a>
   <a href="#fragen">Häufige Fragen</a>
  </nav>

  <section className="digital-tool-section" id="so-funktionierts" aria-labelledby="workflow-heading">
   <span className="eyebrow">PRAXISBEISPIEL</span>
   <h2 id="workflow-heading">So könnte dein erster Funnel aussehen</h2>
   <p>Angenommen, du bietest ein kostenloses E-Book an. Statt Besucher nur auf die Startseite zu schicken, kannst du einen klaren Ablauf planen:</p>
   <ol className="digital-tool-steps">
    <li><strong>Landingpage erstellen.</strong><span>Du beschreibst den Nutzen des E-Books und platzierst ein Anmeldeformular.</span></li>
    <li><strong>Anmeldung entgegennehmen.</strong><span>Interessenten hinterlassen ihre Kontaktdaten; für E-Mail-Marketing sind Einwilligung und Datenschutz zu beachten.</span></li>
    <li><strong>E-Mails vorbereiten.</strong><span>Nach der Anmeldung kannst du Informationen oder Folgeangebote über die vorhandenen E-Mail-Funktionen bereitstellen.</span></li>
    <li><strong>Ergebnisse auswerten.</strong><span>Mit passenden Tests und Auswertungen lässt sich prüfen, wie Besucher mit deinen Seiten umgehen.</span></li>
   </ol>
   <p>Das ist ein Anwendungsbeispiel, keine Zusage für mehr Verkäufe. Ob dein Funnel funktioniert, hängt vor allem vom Angebot, der Zielgruppe und der Umsetzung ab.</p>
  </section>

  <section className="digital-tool-section" id="funktionen" aria-labelledby="features-heading">
   <span className="eyebrow">DIE WICHTIGSTEN WERKZEUGE</span>
   <h2 id="features-heading">Welche Funktionen stecken in FunnelCockpit?</h2>
   <div className="digital-feature-list">
    <div><h3>Websites, Landingpages und Funnels</h3><p>Mit dem FunnelBuilder lassen sich Seiten visuell zusammenstellen. Der Anbieter bietet Vorlagen und Elemente für Texte, Bilder, Formulare oder Handlungsaufforderungen. Du benötigst dafür nicht zwingend eine selbst programmierte Website.</p></div>
    <div><h3>E-Mail-Marketing und Formulare</h3><p>Für die Gewinnung und Begleitung von Kontakten bietet die Plattform Formulare und E-Mail-Werkzeuge. Wichtig ist, bereits vor dem Start eine sinnvolle Kontaktstrecke zu planen und die rechtlichen Anforderungen einzuhalten.</p></div>
    <div><h3>Onlinekurse und Mitgliederbereiche</h3><p>Für Schulungen oder bezahlte Inhalte lassen sich geschützte Bereiche mit Lektionen und Zugriffsregeln aufbauen. Je nach Tarif unterscheiden sich die verfügbaren Mitgliederbereiche und weitere Kontingente.</p></div>
    <div><h3>Tests, CRM und weitere Werkzeuge</h3><p>A/B-Tests gehören laut Preisliste zu allen Tarifen. Ein CRM-System wird erst ab Standard angeboten, die Team-Funktion erst ab Business. Bei KI-Werkzeugen solltest du genau prüfen, welche Funktionen bereits freigeschaltet und welche noch angekündigt sind.</p></div>
   </div>
   <div className="digital-tool-picture-grid">
    <Screenshot src={screenshots.templates} alt="FunnelCockpit-Vorlagenübersicht im Seitenbaukasten mit auswählbaren Hero-Bereichen"
     caption="Beispiel für die Auswahl vorgefertigter Abschnitte im Builder."
     source="https://tutorials.funnelcockpit.com/funnelbuilder/" width={740} height={560}/>
    <Screenshot src={screenshots.dashboard} alt="Beispielabbildung eines FunnelCockpit-Dashboards mit Demo-Kennzahlen und Projektübersicht"
     caption="Beispiel-Dashboard mit Demonstrationsdaten. Abgebildete Kennzahlen sind keine von FindMyDup geprüften Geschäftsergebnisse."
     source="https://funnelcockpit.com/" width={740} height={560}/>
   </div>
   <p>Mehr Details und Anleitungen findest du in den <a href="https://funnelcockpit.com/funktionen/" target="_blank" rel="noopener noreferrer">offiziellen Funktionen</a> und den <a href="https://funnelcockpit.com/tutorials/" target="_blank" rel="noopener noreferrer">Schritt-für-Schritt-Tutorials</a> von FunnelCockpit.</p>
  </section>

  <section className="digital-tool-section" id="preise" aria-labelledby="pricing-heading">
   <span className="eyebrow">WAS DU TATSÄCHLICH BEZAHLST</span>
   <h2 id="pricing-heading">FunnelCockpit-Preise und Testphase</h2>
   <p>Die folgenden Preise stehen auf der offiziellen <a href={product.pricingUrl} target="_blank" rel="noopener noreferrer">Preisseite</a> für monatliche Abrechnung (abgerufen im Oktober 2026). Bei jährlicher Zahlung können andere Konditionen gelten.</p>
   <div className="digital-price-grid">
    <div><strong>Lite</strong><span>47 € / Monat</span><p>5 Projekte, 1 Mitgliederbereich, PageBuilder, E-Mail-Marketing, A/B-Tests und 500 AI-Credits pro Monat.</p></div>
    <div><strong>Standard</strong><span>97 € / Monat</span><p>10 Projekte, 3 Mitgliederbereiche, CRM, Webinare und 1.000 AI-Credits pro Monat.</p></div>
    <div><strong>Business</strong><span>297 € / Monat</span><p>50 Projekte, unbegrenzte Mitgliederbereiche, Team-Funktion und 2.500 AI-Credits pro Monat.</p></div>
   </div>
   <div className="digital-tool-cost-warning">
    <strong>Die 1-€-Testphase ist kein Einmalkauf.</strong>
    <p>Nach 14 Tagen gilt der ausgewählte kostenpflichtige Tarif. Möchtest du nicht verlängern, kündige innerhalb der Testphase über die Kontoeinstellungen. Prüfe die aktuellen Vertrags- und Zahlungsbedingungen direkt vor dem Abschluss.</p>
   </div>
   <p><strong>Rechenbeispiel:</strong> Beim Lite-Tarif kosten zwölf reguläre Monate 564 € bei unverändertem Monatspreis, ohne Testphase oder zusätzliche Optionen. Rechne deshalb mit laufenden Softwarekosten und nicht nur mit dem anfänglichen Testpreis.</p>
  </section>

  <section className="digital-tool-section" id="fuer-wen" aria-labelledby="who-heading">
   <span className="eyebrow">EINSCHÄTZUNG STATT WERBEVERSPRECHEN</span>
   <h2 id="who-heading">Für wen könnte sich FunnelCockpit lohnen?</h2>
   <div className="digital-tool-audience">
    <div><h3>Kann gut passen</h3><ul>
      <li>Coaches und Kursanbieter, die Landingpages mit geschützten Lerninhalten verbinden möchten.</li>
      <li>Selbstständige, die Anmeldeseiten, E-Mail-Kontakte und Funnels in einer Plattform aufbauen wollen.</li>
      <li>Agenturen, die mehrere Projekte verwalten und den Funktionsumfang ihrer Tarife kennen.</li>
    </ul></div>
    <div><h3>Vorher genauer prüfen</h3><ul>
      <li>Wenn du nur eine schlichte Infoseite brauchst, kann ein All-in-One-Abonnement zu umfangreich sein.</li>
      <li>Bei vorhandenen Websites und E-Mail-Diensten ist ein Umzug nicht automatisch sinnvoll.</li>
      <li>Benötigst du CRM, Webinare oder Teamzugänge, reichen die Funktionen des Lite-Tarifs möglicherweise nicht aus.</li>
    </ul></div>
   </div>
   <h3>Unsere Checkliste vor dem Kauf</h3>
   <ul>
    <li>Welche konkreten Funktionen nutzt du wirklich in den nächsten drei Monaten?</li>
    <li>Welche Limits gelten für Projekte, Formulare, Mitgliederbereiche und KI-Credits?</li>
    <li>Welche bestehenden Domains, Formulare oder Kontakte müsstest du übernehmen?</li>
    <li>Wie hoch sind die Gesamtkosten nach der Testphase, und wann musst du kündigen?</li>
   </ul>
   <p><strong>Unsere Einordnung:</strong> FunnelCockpit kann sinnvoll sein, wenn du mehrere seiner Werkzeuge regelmäßig brauchst. Für eine einzelne einfache Website musst du nicht automatisch ein kostenpflichtiges Marketing-Komplettpaket einsetzen.</p>
  </section>

  <section className="digital-tool-section" id="fragen" aria-labelledby="faq-heading">
   <span className="eyebrow">HÄUFIGE FRAGEN</span>
   <h2 id="faq-heading">Gut zu wissen</h2>
   <div className="digital-tool-faq">
    <div><h3>Muss ich etwas installieren?</h3><p>Nein. Laut Anbieter läuft FunnelCockpit im Browser und kann auf verschiedenen Geräten genutzt werden.</p></div>
    <div><h3>Was passiert nach den 14 Tagen?</h3><p>Nach der Testphase gilt das zuvor gewählte kostenpflichtige Abonnement, sofern du nicht rechtzeitig kündigst. Die aktuell gültigen Bedingungen stehen auf der Bestellseite.</p></div>
    <div><h3>Kann ich den Tarif wechseln?</h3><p>Laut Anbieter ist ein Wechsel zwischen den Tarifen möglich. Prüfe dabei, wie sich der neue Preis und deine verfügbaren Funktionen ändern.</p></div>
    <div><h3>Ist FunnelCockpit besser als WordPress?</h3><p>Das hängt vom Projekt ab. FunnelCockpit bündelt mehrere Marketing-Werkzeuge, WordPress ist ein flexibles Content-Management-System mit vielen Erweiterungen. Ein allgemeiner Sieger lässt sich daraus nicht ableiten.</p></div>
    <div><h3>Sind die Bilder eigene Tests von FindMyDup?</h3><p>Nein. Die Abbildungen stammen vom Anbieter und werden zur Orientierung gezeigt. Wir behaupten keine selbst gemessenen Leistungssteigerungen.</p></div>
   </div>
  </section>

  <div className="digital-tool-bottom">
   <span className="eyebrow">NÄCHSTER SCHRITT</span>
   <strong>Passt FunnelCockpit zu deinem Vorhaben?</strong>
   <p>Sieh dir den Funktionsumfang, die Testbedingungen und die aktuellen Tarife direkt beim Anbieter an. Entscheide erst dann, ob sich das Abo für dein Projekt lohnt.</p>
   <div className="digital-tool-actions"><AffiliateButton>FunnelCockpit über Digistore24 ansehen ↗</AffiliateButton><a className="button secondary" href={product.pricingUrl} target="_blank" rel="noopener noreferrer">Original-Preisliste ↗</a></div>
   <p className="affiliate-disclosure">Werbelink · Provision bei Abschluss möglich · Kein eigener Praxistest · Angaben vom Anbieter</p>
  </div>
 </main>;
}
