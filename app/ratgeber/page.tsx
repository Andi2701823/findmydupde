import Link from "next/link";
import type { Metadata } from "next";
import { guides, guideCategories } from "@/lib/guides";
import { GuideCard } from "@/components/guide-card";
import { Icon } from "@/components/icon";
export const metadata: Metadata = {
  title: "Einkaufsratgeber für Mode, Beauty, Wohnen & Technik",
  description: "Unabhängige Einkaufsratgeber zu Materialien, Funktionen, Größen und Preisen. Entdecke, worauf es beim Vergleichen wirklich ankommt.",
};
export default function GuidesPage() {
  return (
    <main id="main" className="shell guides-index">
      <div className="breadcrumb"><Link href="/">Startseite</Link><span>/</span> Einkaufsratgeber</div>
      <span className="eyebrow">WISSEN, DAS BEIM EINKAUF HILFT</span>
      <h1>Bewusster wählen. Besser vergleichen.</h1>
      <p className="guides-intro">
        Ob Hautpflege, Sneaker, Möbel oder Technik: Ein gutes Angebot erkennst du nicht nur am Preis.
        Unsere Ratgeber zeigen dir konkrete Kriterien, mit denen du Produkte selbst vergleichen kannst.
      </p>
      <div className="guide-category-nav" aria-label="Ratgeber nach Themen">
        {guideCategories.map(c => <a key={c} href={`#${c.toLowerCase()}`}>{c} <Icon name="arrow" /></a>)}
      </div>
      {guideCategories.map(category => (
        <section key={category} id={category.toLowerCase()} className="guide-category-section">
          <div className="section-heading">
            <div><span className="eyebrow">EINKAUFSWISSEN</span><h2>{category}</h2></div>
            <Link href={`/suche/?category=${encodeURIComponent(category)}`} className="text-link">
              Thema durchsuchen <Icon name="arrow" />
            </Link>
          </div>
          <div className="guides-grid">{guides.filter(g => g.category === category).map(g => <GuideCard key={g.slug} guide={g} />)}</div>
        </section>
      ))}
      <section className="editorial-contact">
        <h2>Du hast ein Produktthema, das wir erklären sollen?</h2>
        <p>Schreibe uns deine Frage. Wir sammeln Themen, die beim Einkaufen wirklich helfen.</p>
        <a className="button secondary" href="mailto:andreas.paul4282@gmail.com?subject=Themenvorschlag%20FindMyDup">Thema vorschlagen <Icon name="arrow" /></a>
      </section>
    </main>
  );
}
