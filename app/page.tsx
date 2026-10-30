import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { SearchBox } from "@/components/search-box";
import {WebsiteJsonLd,OrganizationJsonLd} from "@/components/seo-jsonld";
import { GuideCard } from "@/components/guide-card";
import { Icon } from "@/components/icon";
import { guides } from "@/lib/guides";
import { MerchantDirectoryCard } from "@/components/merchant-directory-card";
export const metadata: Metadata = {
  title: {absolute:"FindMyDup: Produkte entdecken und Händlerpreise vergleichen"},
  description: "Suche Produkte aus Händlerkatalogen, vergleiche Preisangaben und finde praktische Einkaufsratgeber. Aktuelle Preise und Verfügbarkeit prüfst du im Shop.",
  openGraph:{type:"website",title:"FindMyDup – Produkte suchen und Preise vergleichen",description:"Entdecke Händlerkataloge und vergleiche passende Produktangebote.",url:"https://findmydup.de/",images:[{url:"https://findmydup.de/share-image/",width:1200,height:630,type:"image/png",alt:"FindMyDup – Produkte suchen und Preise vergleichen"}]},
  alternates: { canonical: "https://findmydup.de/" },
};
const categories = [
  { name: "Mode", sub: "Passform, Material & Alltag", image: "bag" },
  { name: "Beauty", sub: "Inhaltsstoffe & Hautpflege", image: "serum" },
  { name: "Wohnen", sub: "Maße, Licht & Materialien", image: "lamp" },
  { name: "Technik", sub: "Funktionen & echte Kriterien", image: "headphones" },
];
export default function Home() {
  return <main id="main">
    <WebsiteJsonLd/>
    <OrganizationJsonLd/>
    <section className="hero shell search-first-hero">
      <div className="hero-copy">
        <span className="eyebrow"><span className="little-star">✳</span> PRODUKTE SUCHEN. BESSER ENTSCHEIDEN.</span>
        <h1>Finde Produkte.<br /><span className="underlined">Vergleiche Preise.</span></h1>
        <p className="hero-description">Suche nach einem Wunschprodukt und entdecke passende Händlerangebote. Vergleiche Preise und prüfe, welches Produkt zu deinen Bedürfnissen passt.</p>
        <SearchBox />
      </div>
      <div className="hero-visual" aria-label="Illustrationen aus den Bereichen Beauty und Technik">
        <div className="visual-grid" />
        <span className="visual-top-label"><Icon name="sparkle" /> PRODUKTE AUS VERSCHIEDENEN KATEGORIEN</span>
        <div className="visual-ring" />
        <div className="floating-reference">
          <span>BEAUTY</span>
          <Image src="/products/serum.svg" alt="" width={245} height={245} />
          <span className="reference-caption">Pflegeprodukte entdecken</span>
        </div>
        <div className="floating-match">
          <span className="match-label"><Icon name="check" /> TECHNIK</span>
          <Image src="/products/headphones.svg" alt="" width={290} height={290} />
          <div><strong>Suchen.<br />Vergleichen.</strong><span className="visual-arrow">↗</span></div>
        </div>
        <div className="float-sparkle">✳</div>
        <span className="visual-bottom-label">Illustrationen zur Gestaltung, keine Händlerangebote</span>
      </div>
    </section>
    <div className="trust-strip">
      <div className="shell trust-inner">
        <span><Icon name="search" /> Produkte nach Namen suchen</span>
        <span><Icon name="shield" /> Ohne Anmeldung suchen</span>
        <span><Icon name="heart" /> Einkaufsratgeber entdecken</span>
        <span className="trust-demo">Echte Händlerangebote transparent gekennzeichnet</span>
      </div>
    </div>
    <section className="how-section" id="so-gehts">
      <div className="shell">
        <div className="how-header">
          <span className="eyebrow">DEINE PRODUKTSUCHE</span>
          <h2>Vom Suchbegriff<br/>zum passenden Produkt.</h2>
          <p>So findest du Angebote und hilfreiche Informationen zu deinem Wunschprodukt.</p>
        </div>
        <div className="steps-grid">
          {[
            {n:"01",icon:"search" as const,title:"Produkt suchen",text:"Gib einen Produktnamen oder einen Suchbegriff ein. Du siehst Treffer aus unserem vorhandenen Händlerkatalog."},
            {n:"02",icon:"check" as const,title:"Details prüfen",text:"Sieh dir Produktbeschreibungen und Angaben aus dem Händlerfeed an. Vergleiche Eigenschaften und Kaufkriterien."},
            {n:"03",icon:"arrow" as const,title:"Zum Händler wechseln",text:"Prüfe den aktuellen Preis und die Verfügbarkeit im Shop. Händlerlinks sind als Werbung gekennzeichnet."},
          ].map(step => <div className="step" key={step.n}>
            <div className="step-top"><span>{step.n}</span><Icon name={step.icon} /></div>
            <h3>{step.title}</h3><p>{step.text}</p>
          </div>)}
        </div>
      </div>
    </section>
    <section className="shell section-space" id="kategorien">
      <div className="section-heading"><div><span className="eyebrow">PRODUKTE & EINKAUFSWISSEN</span><h2>Diese Themen kannst du entdecken.</h2><p>Entdecke Einkaufsratgeber zu wichtigen Eigenschaften, Materialien und Kaufkriterien.</p></div>
        <Link href="/ratgeber/" className="text-link">Alle Ratgeber <Icon name="arrow" /></Link></div>
      <div className="category-grid">
        {categories.map(c => <Link href={`/ratgeber/#${c.name.toLowerCase()}`} className={`category-tile tile-${c.name}`} key={c.name}>
          <Image src={`/products/${c.image}.svg`} alt="" width={180} height={180}/>
          <div><h3>{c.name}</h3><p>{c.sub}</p></div>
          <span className="category-arrow"><Icon name="arrow" /></span>
        </Link>)}
      </div>
    </section>
    <section className="shell section-space showcase" id="haendler">
      <div className="section-heading">
        <div><span className="eyebrow">HÄNDLERKATALOGE ENTDECKEN</span><h2>Finde Produkte aus verschiedenen Bereichen.</h2>
          <p>Durchsuche vorhandene Kataloge nach Modell oder Produktname. Weitere aktuell verfügbare Händler findest du in der vollständigen Händlerübersicht.</p></div>
        <Link href="/produkte/" className="text-link">Alle Händler ansehen <Icon name="arrow" /></Link>
      </div>
      <div className="merchant-directory-grid">
        <MerchantDirectoryCard label="IMOU DE · AWIN" name="Überwachungskameras & Smart Home"
          description="IMOU Kameras, Video-Türklingeln und Zubehör nach Modellen entdecken."
          href="/imou/" action="IMOU entdecken" accent="imou"/>
        <MerchantDirectoryCard label="ANTHBOT DE · AWIN" name="Mähroboter & Zubehör"
          description="ANTHBOT Mähroboter, Modellvarianten und Zubehör durchstöbern."
          href="/anthbot/" action="ANTHBOT entdecken" accent="anthbot"/>
        <MerchantDirectoryCard label="WEITERE HÄNDLER" name="Produktkatalog"
          description="Weitere angebundene Händler und Beauty-Produkte in der Übersicht finden."
          href="/produkte/" action="Zum Produktkatalog" accent="beauty"/>
      </div>
    </section>
    <section className="shell section-space showcase">
      <div className="section-heading"><div><span className="eyebrow">UNSERE EINKAUFSRATGEBER</span><h2>Das lohnt sich zu wissen.</h2><p>Konkrete Checklisten und verständliche Tipps statt unbelegter Produktversprechen.</p></div>
        <Link href="/ratgeber/" className="text-link">Alle Beiträge <Icon name="arrow" /></Link>
      </div>
      <div className="guides-grid">{[guides[0],guides[2],guides[4],guides[6]].map(guide => <GuideCard guide={guide} key={guide.slug}/>)}</div>
    </section>
    <section className="shell about-section">
      <div className="about-mark">f<span>↗</span></div>
      <div><span className="eyebrow">UNSER ANSPRUCH</span><h2>Produkte finden. Angebote einordnen.</h2>
        <p>Ein ähnlicher Look bedeutet nicht automatisch gleiche Qualität. Deshalb verbinden wir Produktsuche mit verständlichen Kaufhinweisen. Händlerlinks sind als Werbung gekennzeichnet; Preise und Verfügbarkeit prüfst du im Shop.</p>
      </div>
      <Link href="/ueber-uns/" className="button secondary">Mehr über uns <Icon name="arrow" /></Link>
    </section>
    <section className="shell editorial-partner">
      <div><span className="eyebrow">FÜR HÄNDLER UND MARKEN</span><h2>Verständliche Inhalte. Faire Zusammenarbeit.</h2>
        <p>FindMyDup verbindet Produktsuche mit verständlichen Einkaufsinformationen. Unser Händlerkatalog kann mit weiteren freigegebenen Sortimenten wachsen.</p>
      </div>
      <Link href="/partner/" className="button secondary">Für Händler <Icon name="arrow" /></Link>
    </section>
  </main>;
}
