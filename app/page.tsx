import Image from "next/image";
import Link from "next/link";
import { SearchBox } from "@/components/search-box";
import { ProductCard } from "@/components/product-card";
import { Icon } from "@/components/icon";
import { products } from "@/lib/catalog";
const categoryTiles = [
  { name: "Mode", sub: "Looks, die zu dir passen", image: "bag" },
  { name: "Beauty", sub: "Neue Favoriten entdecken", image: "serum" },
  { name: "Wohnen", sub: "Mehr Stil für dein Zuhause", image: "lamp" },
  { name: "Technik", sub: "Smart suchen, neu entdecken", image: "headphones" },
];
export default function Home() {
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
            Du hast etwas Schönes entdeckt? Finde ähnliche Produkte, die zu
            deinem Stil und deinem Budget passen.
          </p>
          <SearchBox />
          <p className="hero-footnote">
            Ein erster Einblick in FindMyDup. Alle Produkte sind Demo-Beispiele.
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
            <Icon name="search" /> Zwei Wege zum Lieblingsstück
          </span>
          <span>
            <Icon name="shield" /> Kein Konto nötig
          </span>
          <span>
            <Icon name="heart" /> Funde einfach merken
          </span>
          <span className="trust-demo">
            Transparent von Anfang an: Demo-Katalog
          </span>
        </div>
      </div>
      <section className="shell section-space" id="kategorien">
        <div className="section-heading">
          <div>
            <span className="eyebrow">WAS MÖCHTEST DU ENTDECKEN?</span>
            <h2>Deine Welt. Dein Geschmack.</h2>
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
            <h2>Schöne Funde. Gute Ideen.</h2>
            <p>So könnten deine Ergebnisse aussehen. Alles hier ist Demo.</p>
          </div>
          <Link href="/suche/" className="text-link">
            Demo-Katalog ansehen <Icon name="arrow" />
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
            <p>Foto oder Name. Du entscheidest, wo es losgeht.</p>
          </div>
          <div className="steps-grid">
            {[
              {
                n: "01",
                icon: "image" as const,
                title: "Zeig uns deinen Stil",
                text: "Gib einen Produktnamen ein oder wähle ein Foto. Bilder bleiben in dieser Demo nur auf deinem Gerät.",
              },
              {
                n: "02",
                icon: "search" as const,
                title: "Entdecke die Möglichkeiten",
                text: "Erkunde den Beispielkatalog. Die Bilddemo zeigt eine gewählte Kategorie, keine KI-Treffer.",
              },
              {
                n: "03",
                icon: "heart" as const,
                title: "Behalte deine Favoriten",
                text: "Filtere nach deinem Geschmack und merke deine Funde. Echte Shop-Angebote folgen erst später.",
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
            oder Wirkung aus. FindMyDup soll dir später echte Alternativen
            zeigen, mit nachvollziehbaren Produktdaten. Dieser Prototyp macht
            die Idee schon heute erlebbar.
          </p>
        </div>
        <Link href="/suche/" className="button secondary">
          Jetzt ausprobieren <Icon name="arrow" />
        </Link>
      </section>
    </main>
  );
}
