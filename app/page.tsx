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
  title: "FindMyDup – Bewusster einkaufen und Produkte besser vergleichen",
  description: "FindMyDup hilft dir, Produkte aus Mode, Beauty, Wohnen und Technik besser zu verstehen. Unabhängige Einkaufsratgeber mit praktischen Checklisten.",
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
    <section className="hero shell">
      <div className="hero-copy">
        <span className="eyebrow"><span className="little-star">✳</span> ENTDECKEN. VERSTEHEN. VERGLEICHEN.</span>
        <h1>Dein Stil.<br />Deine <span className="underlined">Wahl.</span></h1>
        <p className="hero-description">Entdecke Produkte, die zu dir passen. Unsere Ratgeber helfen dir, Qualität, Eigenschaften und Preise besser einzuschätzen.</p>
        <SearchBox />
      </div>
      <div className="hero-visual" aria-label="Stilisierte Illustrationen von zwei Handtaschen">
        <div className="visual-grid" />
        <span className="visual-top-label"><Icon name="sparkle" /> STIL BEWUSST ENTDECKEN</span>
        <div className="visual-ring" />
        <div className="floating-reference">
          <span>FORM UND FUNKTION</span>
          <Image src="/products/bag-tan.svg" alt="" width={245} height={245} />
          <span className="reference-caption">Was passt zu dir?</span>
        </div>
        <div className="floating-match">
          <span className="match-label"><Icon name="check" /> DETAILS VERGLEICHEN</span>
          <Image src="/products/bag.svg" alt="" width={290} height={290} />
          <div><strong>Mehr wissen.<br />Besser wählen.</strong><span className="visual-arrow">↗</span></div>
        </div>
        <div className="float-sparkle">✳</div>
        <span className="visual-bottom-label">Illustrationen zur Gestaltung, keine Händlerangebote</span>
      </div>
    </section>
    <div className="trust-strip">
      <div className="shell trust-inner">
        <span><Icon name="search" /> Einkaufsratgeber durchsuchen</span>
        <span><Icon name="shield" /> Ohne Anmeldung lesen</span>
        <span><Icon name="heart" /> Ratgeber merken</span>
        <span className="trust-demo">Kaufkriterien statt Werbeversprechen</span>
      </div>
    </div>
    <section className="shell section-space" id="kategorien">
      <div className="section-heading"><div><span className="eyebrow">WAS INTERESSIERT DICH?</span><h2>Vier Welten. Viele gute Fragen.</h2></div>
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
        <div><span className="eyebrow">UNSER ERSTER AFFILIATE-PARTNER</span><h2>Beauty-Produkte von bdr-beauty.</h2>
          <p>Echte Produkte mit Händlerbildern und klar gekennzeichneten Werbelinks. Die angezeigten Feedpreise können vom aktuellen Shoppreis abweichen.</p></div>
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
    <section className="how-section" id="so-gehts">
      <div className="shell">
        <div className="how-header">
          <span className="eyebrow">SO NUTZT DU FINDMYDUP</span>
          <h2>Vom ersten Interesse<br/>zur guten Entscheidung.</h2>
          <p>In drei Schritten zu den Kriterien, die wirklich zählen.</p>
        </div>
        <div className="steps-grid">
          {[
            {n:"01",icon:"search" as const,title:"Thema suchen",text:"Suche nach Produkten oder stöbere in Mode, Beauty, Wohnen und Technik."},
            {n:"02",icon:"check" as const,title:"Kriterien verstehen",text:"Lies nach, welche Materialien, Größen, Funktionen und Kosten wichtig sind."},
            {n:"03",icon:"heart" as const,title:"Wissen merken",text:"Speichere hilfreiche Ratgeber in deiner Merkliste für den nächsten Einkauf."},
          ].map(step => <div className="step" key={step.n}>
            <div className="step-top"><span>{step.n}</span><Icon name={step.icon} /></div>
            <h3>{step.title}</h3><p>{step.text}</p>
          </div>)}
        </div>
      </div>
    </section>
    <section className="shell about-section">
      <div className="about-mark">f<span>↗</span></div>
      <div><span className="eyebrow">ÄHNLICH IST NICHT IDENTISCH</span><h2>Wissen macht den Unterschied.</h2>
        <p>Ein ähnlicher Look ist kein Beleg für gleiche Qualität. Wir zeigen dir, welche Angaben du prüfen kannst. Händlerangebote und Affiliate-Links werden, sobald verfügbar und freigegeben, getrennt und transparent gekennzeichnet.</p>
      </div>
      <Link href="/ueber-uns/" className="button secondary">Mehr über uns <Icon name="arrow" /></Link>
    </section>
    <section className="shell editorial-partner">
      <div><span className="eyebrow">FÜR HÄNDLER UND MARKEN</span><h2>Verständliche Inhalte. Faire Zusammenarbeit.</h2>
        <p>Wir verbinden hilfreiche Einkaufsinformationen mit einem transparenten Ansatz für künftige Händlerpartnerschaften.</p>
      </div>
      <Link href="/partner/" className="button secondary">Für Händler <Icon name="arrow" /></Link>
    </section>
  </main>;
}
