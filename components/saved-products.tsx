"use client";
import Link from "next/link";
import { guides } from "@/lib/guides";
import { useFavorites } from "./favorites";
import { GuideCard } from "./guide-card";
import { Icon } from "./icon";
export function SavedProducts() {
  const { ids } = useFavorites();
  const saved = guides.filter(g => ids.includes(g.slug));
  return <>
    <nav className="breadcrumb"><Link href="/">Startseite</Link><span>/</span> Merkliste</nav>
    <div className="results-heading"><span className="eyebrow">FÜR SPÄTER MERKEN</span><h1>Deine Lieblingsratgeber.</h1>
      <p>Hier findest du deine gespeicherten Lesetipps wieder. Die Merkliste wird nur in deinem Browser gespeichert, ohne Nutzerkonto.</p></div>
    <p role="status" className="saved-count">{saved.length} {saved.length === 1 ? "Ratgeber" : "Ratgeber"} gemerkt</p>
    {saved.length ? <div className="guides-grid">{saved.map(g => <GuideCard key={g.slug} guide={g} />)}</div> :
      <section className="empty-state"><Icon name="heart" /><h2>Platz für deine Favoriten.</h2>
        <p>Merke interessante Einkaufsratgeber über das Herzsymbol und finde sie hier jederzeit wieder.</p>
        <Link href="/ratgeber/" className="button primary">Ratgeber entdecken <Icon name="arrow" /></Link>
      </section>}
  </>;
}
