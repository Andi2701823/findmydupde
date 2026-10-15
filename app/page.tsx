import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { SearchBox } from "@/components/search-box";
import { GuideCard } from "@/components/guide-card";
import { Icon } from "@/components/icon";
import { guides } from "@/lib/guides";
import { affiliateProducts } from "@/lib/affiliate-products";
import { AffiliateProductCard } from "@/components/affiliate-product-card";
export const metadata: Metadata = {
  title: {absolute:"FindMyDup: Preise vergleichen & günstigere Alternativen finden"},
  description: "Suche dein Wunschprodukt, vergleiche Händlerangebote nach Preis und entdecke passende Alternativen. FindMyDup zeigt transparente Preise und hilfreiche Kauftipps.",
  openGraph:{title:"FindMyDup – Produkte suchen und Preise vergleichen",description:"Finde passende Händlerangebote und entdecke Alternativen.",url:"https://findmydup.de/"},
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
    <section className="hero shell search-first-hero">
      <div className="hero-copy">
        <span className="eyebrow"><span className="little-star">✳</span> PRODUKTE SUCHEN. BESSER ENTSCHEIDEN.</span>
        <h1>Finde Produkte.<br />Entdecke <span className="underlined">mehr.</span></h1>
        <p className="hero-description">Du suchst ein bestimmtes Produkt? Starte mit einem Namen oder Stichwort. Entdecke echte Händlerprodukte und hilfreiche Tipps für deine Kaufentscheidung.</p>
        <SearchBox />
      </div>
      <div className="hero-visual" aria-label="Stilisierte Illustrationen von zwei Handtaschen">
        <div className="visual-grid" />
        <span className="visual-top-label"><Icon name="sparkle" /> INSPIRATION FÜR DEINE PRODUKTSUCHE</span>
        <div className="visual-ring" />
        <div className="floating-reference">
          <span>DEIN WUNSCHPRODUKT</span>
          <Image src="/products/bag-tan.svg" alt="" width={245} height={245} />
          <span className="reference-caption">So etwas suchst du?</span>
        </div>
        <div className="floating-match">
          <span className="match-label"><Icon name="check" /> PRODUKTE ENTDECKEN</span>
          <Image src="/products/bag.svg" alt="" width={290} height={290} />
          <div><strong>Suchen.<br />Entdecken.</strong><span className="visual-arrow">↗</span></div>
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
          <p>So nutzt du die aktuelle Produktsuche. Eine Bildsuche mit KI ist für eine spätere Ausbaustufe geplant.</p>
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
      <div className="section-heading"><div><span className="eyebrow">PRODUKTE & EINKAUFSWISSEN</span><h2>Diese Themen kannst du entdecken.</h2><p>Beauty-Produkte sind bereits im Katalog. Für Mode, Wohnen und Technik findest du passende Ratgeber; weitere Händlerangebote sollen folgen.</p></div>
        <Link href="/ratgeber/" className="text-link">Alle Ratgeber <Icon name="arrow" /></Link></div>
      <div className="category-grid">
        {categories.map(c => <Link href={`/suche/?category=${encodeURIComponent(c.name)}`} className={`category-tile tile-${c.name}`} key={c.name}>
          <Image src={`/products/${c.image}.svg`} alt="" width={180} height={180}/>
          <div><h3>{c.name}</h3><p>{c.sub}</p></div>
          <span className="category-arrow"><Icon name="arrow" /></span>
        </Link>)}
      </div>
    </section>
    <section className="shell section-space showcase" id="beauty-produkte">
      <div className="section-heading">
        <div><span className="eyebrow">AUS UNSEREM AKTUELLEN KATALOG</span><h2>Produkte, die du jetzt entdecken kannst.</h2>
          <p>Unsere ersten geprüften Katalogeinträge stammen von bdr-beauty. Weitere Händler möchten wir ergänzen. Preisangaben aus dem Feed können vom aktuellen Shoppreis abweichen.</p></div>
        <Link href="/produkte/" className="text-link">Alle 63 Produkte ansehen <Icon name="arrow" /></Link>
      </div>
      <div className="affiliate-grid affiliate-featured">
        {affiliateProducts.filter(p => ["1352","269","242","110"].includes(p.id)).map(product => <AffiliateProductCard key={product.id} product={product}/>)}
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
