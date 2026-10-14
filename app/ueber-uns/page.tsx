import Link from "next/link";
import type { Metadata } from "next";
export const metadata: Metadata = {title:"Über FindMyDup",description:"Wofür FindMyDup steht: verständliche Einkaufshilfen, transparente Empfehlungen und ein fairer Blick auf Produkte."};
export default function AboutPage(){return <main id="main" className="shell legal-page">
  <span className="eyebrow">ÜBER FINDMYDUP</span>
  <h1>Mehr wissen, bevor du kaufst.</h1>
  <p>FindMyDup ist eine unabhängige deutschsprachige Website rund um bewusstes Einkaufen. Wir helfen dir dabei, Produkte nicht nur anhand von Marken, Werbung oder dem ersten Preis zu beurteilen, sondern die Eigenschaften zu verstehen, auf die es ankommt.</p>
  <h2>Was du hier findest</h2>
  <p>Unsere Einkaufsratgeber erklären Unterschiede bei Materialien, Größen, Inhaltsstoffen, Funktionen und Kosten. Sie unterstützen dich mit nachvollziehbaren Fragen und Checklisten – damit du Angebote eigenständig einordnen kannst.</p>
  <h2>Unser Maßstab</h2>
  <p>Ähnliche Optik heißt nicht gleiche Qualität. Deshalb stellen wir Produkte nicht ohne überprüfbare Informationen als identisch dar. Wir erfinden weder Händlerpreise noch Bewertungen oder Produkttests.</p>
  <h2>So finanzieren wir uns</h2>
  <p>FindMyDup zeigt ausgewählte Angebote freigegebener Händler mit entsprechend gekennzeichneten Affiliate-Links. Kommt über einen solchen Link ein Kauf zustande, können wir eine Provision erhalten. Die redaktionellen Ratgeber sind unabhängig davon lesbar.</p>
  <h2>Kontakt</h2>
  <p>Du hast Fragen, Anregungen oder möchtest eine Kooperation besprechen? Schreibe an <a href="mailto:andreas.paul4282@gmail.com">andreas.paul4282@gmail.com</a>.</p>
  <Link href="/ratgeber/" className="button primary">Ratgeber entdecken</Link>
</main>;}
