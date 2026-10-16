import {supportEmail} from "@/lib/site-contact";
import type { Metadata } from "next";
export const metadata: Metadata = {title:"Impressum",description:"Anbieterkennzeichnung und Kontaktinformationen von FindMyDup.",alternates:{canonical:"https://findmydup.de/impressum/"}};
export default function Imprint(){return <main id="main" className="shell legal-page">
  <span className="eyebrow">ANBIETERINFORMATIONEN</span>
  <h1>Impressum</h1>
  <h2>Angaben gemäß § 5 DDG</h2>
  <p>Andreas Paul<br/>FindMyDup<br/>Germersheimer Straße 17<br/>70499 Stuttgart<br/>Deutschland</p>
  <h2>Kontakt</h2>
  <p>E-Mail: <a href={"mailto:"+supportEmail}>{supportEmail}</a></p>
  <h2>Inhaltlich verantwortlich</h2>
  <p>Andreas Paul<br/>Germersheimer Straße 17<br/>70499 Stuttgart</p>
  <h2>Hinweis zu redaktionellen Inhalten</h2>
  <p>Die Inhalte auf FindMyDup dienen der allgemeinen Information zu Produkten und Kaufkriterien. Wir übernehmen keine Gewähr für die Vollständigkeit oder dauerhafte Aktualität von Angaben Dritter. Verbindliche Angaben zu Preisen, Warenverfügbarkeit und Lieferbedingungen stehen beim jeweiligen Anbieter.</p>
</main>;}
