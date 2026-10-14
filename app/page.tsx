import Image from "next/image";
import type { Metadata } from "next";
import Link from "next/link";
import { SearchBox } from "@/components/search-box";
import { ProductCard } from "@/components/product-card";
import { Icon } from "@/components/icon";
import { products } from "@/lib/catalog";
import { stagingLiveCatalogEnabled, stagingEbaySearchEnabled } from "@/server/catalog/live-mode.ts";
export const metadata: Metadata = {
  title: { absolute: "FindMyDup | Produkte entdecken und Alternativen finden" },
  description:
    "FindMyDup entwickelt eine transparente Produktsuche für Mode, Beauty, Wohnen und Technik. Erfahre, wie die Suche funktioniert und welche Angebote bereits verfügbar sind.",
};
const categoryTiles = [
  { name: "Mode", sub: "Looks, die zu dir passen", image: "bag" },
  { name: "Beauty", sub: "Neue Favoriten entdecken", image: "serum" },
  { name: "Wohnen", sub: "Mehr Stil für dein Zuhause", image: "lamp" },
  { name: "Technik", sub: "Smart suchen, neu entdecken", image: "headphones" },
];
export const dynamic = "force-dynamic";
export default function Home() {
  const liveCatalog = stagingLiveCatalogEnabled();
  const ebaySearch = stagingEbaySearchEnabled() && !liveCatalog;
  return (
    <main id="main">
      <section className="hero shell">
        <div className="hero-copy">
          <span className="eyebrow">
            <span className="little-star">✳</span> GUTER STIL MUSS NICHT TEUER
            SEIN
          </span>
          <h1>
            Dein Stil.
            <br />
            Für <span className="underlined">weniger.</span>
          </h1>
          <p className="hero-description">
            Du hast ein Produkt entdeckt, das dir gefällt? FindMyDup hilft dir
            dabei, weitere Ideen und passende Angebote aus unterschiedlichen
            Shops zu entdecken. Wir bauen den Händlerkatalog gerade auf.
          </p>
          <SearchBox liveCatalog={liveCatalog || ebaySearch} />
          <p className="hero-footnote">
            {ebaySearch
              ? "eBay-Textsuche im Testbetrieb. Die Produktbilder und Beispielpreise dieser Startseite bleiben Demo."
              : liveCatalog
                ? "Textsuche im Testbetrieb. Händlerangebote folgen nach Freigabe; Bilder und Beispielpreise auf dieser Startseite sind Demo."
                : "Vorschau im Aufbau. Alle gezeigten Produkte und Preise sind als Beispiele erfunden."}
          </p>
        </div>
        <div
          className="hero-visual"
          aria-label="Illustration eines fiktiven Produktvergleichs"
        >
          <div className="visual-grid" />
          <span className="visual-top-label">
            <Icon name="sparkle" /> Gleicher Vibe. Neues Lieblingsstück.
          </span>
          <div className="visual-ring" />
          <div className="floating-reference">
            <span>DEIN INSPIRATIONSSTÜCK</span>
            <Image
              src="/products/bag-tan.svg"
              alt="Illustration einer fiktiven braunen Inspirationstasche"
              width={245}
              height={245}
            />
            <span className="reference-caption">
              Ein Look, der dir gefällt.
            </span>
          </div>
          <div className="floating-match">
            <span className="match-label">
              <Icon name="check" /> DEMO-ALTERNATIVE
            </span>
            <Image
              src="/products/bag.svg"
              alt="Illustration einer fiktiven grünen Alternative"
              width={290}
              height={290}
            />
            <div>
              <strong>
                Neuer Look.
                <br />
                Kleineres Budget.
              </strong>
              <span className="visual-arrow">↗</span>
            </div>
          </div>
          <div className="float-sparkle">✳</div>
          <span className="visual-bottom-label">
            Illustrationen · keine echten Angebote
          </span>
        </div>
      </section>
      <div className="trust-strip">
        <div className="shell trust-inner">
          <span>
            <Icon name="search" /> {ebaySearch ? "eBay-Angebote im Testbetrieb" : liveCatalog ? "Textsuche im Testbetrieb" : "Produktsuche ausprobieren"}
          </span>
          <span>
            <Icon name="shield" /> Ohne Registrierung testen
          </span>
          <span>
            <Icon name="heart" /> Beispielprodukte merken
          </span>
          <span className="trust-demo">
            {ebaySearch ? "Angebote von eBay, Preise beim Händler prüfen" : "Echte Händlerangebote erst nach Freigabe"}
          </span>
        </div>
      </div>
      <section className="shell section-space" id="kategorien">
        <div className="section-heading">
          <div>
            <span className="eyebrow">WAS MÖCHTEST DU ENTDECKEN?</span>
            <h2>Entdecke deine Produktwelt.</h2>
          </div>
          <Link href="/suche/" className="text-link">
            Alles entdecken <Icon name="arrow" />
          </Link>
        </div>
        <div className="category-grid">
          {categoryTiles.map((c) => (
            <Link
              href={`/suche/?category=${encodeURIComponent(c.name)}`}
              className={`category-tile tile-${c.name}`}
              key={c.name}
            >
              <Image
                src={`/products/${c.image}.svg`}
                alt=""
                width={180}
                height={180}
              />
              <div>
                <h3>{c.name}</h3>
                <p>{c.sub}</p>
              </div>
              <span className="category-arrow">
                <Icon name="arrow" />
              </span>
            </Link>
          ))}
        </div>
      </section>
      <section className="shell section-space showcase">
        <div className="section-heading">
          <div>
            <span className="eyebrow">EIN KLEINER VORGESCHMACK</span>
            <h2>So könnten deine Funde aussehen.</h2>
            <p>Designbeispiele mit erfundenen Produkten und Preisen. Noch keine Händlerangebote.</p>
          </div>
          <Link href="/suche/" className="text-link">
            Beispielkatalog ansehen <Icon name="arrow" />
          </Link>
        </div>
        <div className="product-grid">
          {products.slice(0, 4).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
      <section className="how-section" id="so-gehts">
        <div className="shell">
          <div className="how-header">
            <span className="eyebrow">VON „WILL ICH“ ZU „PASST ZU MIR“</span>
            <h2>
              Ein guter Fund beginnt
              <br />
              mit einer einfachen Suche.
            </h2>
            <p>Die Textsuche ist bereits erlebbar. Die automatische Bildsuche kommt später.</p>
          </div>
          <div className="steps-grid">
            {[
              {
                n: "01",
                icon: "search" as const,
                title: "Starte mit einem Produktnamen",
                text: ebaySearch
                  ? "Suche nach echten eBay-Angeboten. Preise, Zustand und Versand werden aus dem Marktplatz übernommen."
                  : liveCatalog
                  ? "Die Textsuche durchsucht unseren echten Katalog. Partnerangebote erscheinen nach ihrer Freigabe."
                  : "Die Produktsuche lässt sich derzeit mit gekennzeichneten Beispielen ausprobieren.",
              },
              {
                n: "02",
                icon: "search" as const,
                title: "Erkunde deine Möglichkeiten",
                text: ebaySearch
                  ? "Vergleiche Treffer und prüfe den Endpreis direkt bei eBay. Ähnliche Artikel können verschiedene Eigenschaften haben."
                  : liveCatalog
                  ? "Sortiere Treffer und grenze Angebote nach Preis ein, sobald der Produktkatalog befüllt ist."
                  : "Entdecke Produktbeispiele und teste die Filter. Preise und Produkte sind noch nicht echt.",
              },
              {
                n: "03",
                icon: "heart" as const,
                title: "Informiere dich transparent",
                text: "Ähnliche Produkte sind nicht automatisch gleichwertig. Händlerpreise und Links werden erst mit genehmigten Partnerdaten gezeigt.",
              },
            ].map((step) => (
              <div className="step" key={step.n}>
                <div className="step-top">
                  <span>{step.n}</span>
                  <Icon name={step.icon} />
                </div>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </div>
            ))}
          </div>
          <div className="how-guide-cta">
            <Link href="/ratgeber/" className="text-link">
              Worauf du beim Produktvergleich achten solltest <Icon name="arrow" />
            </Link>
          </div>
        </div>
      </section>
      <section className="shell about-section">
        <div className="about-mark">
          f<span>↗</span>
        </div>
        <div>
          <span className="eyebrow">ÄHNLICH IST NICHT IDENTISCH</span>
          <h2>Mehr Auswahl. Deine Entscheidung.</h2>
          <p>
            Ein ähnlicher Look sagt nichts über gleiche Qualität, Materialien
            oder Wirkung aus. FindMyDup setzt auf klar zugeordnete Händlerangebote,
            nachvollziehbare Preisangaben und eine eindeutige Kennzeichnung
            von Beispielen. Wir bauen die Plattform Schritt für Schritt auf.
          </p>
        </div>
        <Link href="/ueber-uns/" className="button secondary">
          Über FindMyDup <Icon name="arrow" />
        </Link>
      </section>
      <section className="shell publisher-section" aria-labelledby="publisher-title">
        <div className="publisher-copy">
          <span className="eyebrow">FÜR HÄNDLER UND MARKEN</span>
          <h2 id="publisher-title">Produkte dort zeigen, wo neue Ideen entstehen.</h2>
          <p>
            FindMyDup ist eine deutschsprachige Produktentdeckungsplattform
            im Aufbau. Wir suchen passende Handelspartner für Mode, Beauty,
            Wohnen und Technik. Angebote übernehmen wir nur aus autorisierten
            Produktdatenquellen. Wir versprechen keine Reichweite, die wir
            noch nicht belegen können.
          </p>
          <Link href="/partner/" className="button primary">
            Zusammenarbeit entdecken <Icon name="arrow" />
          </Link>
        </div>
        <div className="publisher-facts" aria-label="Unsere Grundsätze">
          <div>
            <strong>Nachvollziehbar</strong>
            <span>Händlername, Angebotspreis und Preisstand sollen deutlich sichtbar sein.</span>
          </div>
          <div>
            <strong>Fair gekennzeichnet</strong>
            <span>Beispielprodukte und spätere Affiliate-Verlinkungen werden transparent markiert.</span>
          </div>
          <div>
            <strong>Direkter Shopkontakt</strong>
            <span>Der Kauf findet beim jeweiligen Händler statt, nicht auf FindMyDup.</span>
          </div>
        </div>
      </section>
    </main>
  );
}
