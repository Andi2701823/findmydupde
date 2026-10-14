"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { searchGuides, guideCategories } from "@/lib/guides";
import { SearchBox } from "./search-box";
import { GuideCard } from "./guide-card";
import { Icon } from "./icon";
export function Results() {
  const params = useSearchParams();
  const q = (params.get("q") || "").trim().slice(0, 120);
  const categoryValue = params.get("category") || "";
  const category = guideCategories.find(c => c === categoryValue);
  const items = searchGuides(q, category);
  return <>
    <nav className="breadcrumb" aria-label="Brotkrumennavigation"><Link href="/">Startseite</Link><span>/</span> Suche</nav>
    <div className="results-heading">
      <span className="eyebrow">EINKAUFSWISSEN ENTDECKEN</span>
      <h1>{q ? `Ratgeber zu „${q}“` : category ? `Ratgeber: ${category}` : "Wonach suchst du?"}</h1>
      <p>Finde hilfreiche Informationen zu Kaufkriterien, Materialien, Eigenschaften und Kosten. Hier werden Ratgeber durchsucht, keine aktuellen Händlerpreise.</p>
    </div>
    <SearchBox compact initialQuery={q} />
    <div className="guide-category-nav" aria-label="Thema eingrenzen">
      <Link href={`/suche/${q ? `?q=${encodeURIComponent(q)}` : ""}`} aria-current={!category ? "page" : undefined}>Alle Themen</Link>
      {guideCategories.map(c => <Link key={c} href={`/suche/?${q ? `q=${encodeURIComponent(q)}&` : ""}category=${encodeURIComponent(c)}`} aria-current={category === c ? "page" : undefined}>{c}</Link>)}
    </div>
    <p className="saved-count" role="status">{items.length} {items.length === 1 ? "Ratgeber" : "Ratgeber"} gefunden</p>
    {items.length ? <div className="guides-grid">{items.map(g => <GuideCard key={g.slug} guide={g} />)}</div> :
      <section className="empty-state"><Icon name="search" /><h2>Zu diesem Thema gibt es noch keinen Ratgeber.</h2><p>Versuche einen anderen Begriff oder sieh dir unsere vorhandenen Einkaufsratgeber an.</p><Link href="/ratgeber/" className="button primary">Alle Ratgeber ansehen <Icon name="arrow" /></Link></section>}
  </>;
}
