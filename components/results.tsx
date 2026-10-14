"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { searchGuides, guideCategories } from "@/lib/guides";
import { findAffiliateProducts } from "@/lib/affiliate-products";
import { SearchBox } from "./search-box";
import { GuideCard } from "./guide-card";
import { AffiliateProductCard } from "./affiliate-product-card";
import { Icon } from "./icon";
export function Results(){
  const params=useSearchParams();
  const q=(params.get("q")||"").trim().slice(0,120);
  const categoryValue=params.get("category")||"";
  const category=guideCategories.find(c=>c===categoryValue);
  const guides=searchGuides(q,category);
  const products=category&&category!=="Beauty"?[]:findAffiliateProducts(q);
  return <>
    <nav className="breadcrumb" aria-label="Brotkrumennavigation"><Link href="/">Startseite</Link><span>/</span> Suche</nav>
    <div className="results-heading">
      <span className="eyebrow">PRODUKTE UND EINKAUFSWISSEN ENTDECKEN</span>
      <h1>{q?`Funde zu „${q}“`:category?`Entdecken: ${category}`:"Was möchtest du entdecken?"}</h1>
      <p>Finde echte Beauty-Produkte unseres freigegebenen Partners und hilfreiche Einkaufsratgeber. Die Produktpreise sind Feedangaben und werden nicht live abgefragt.</p>
    </div>
    <SearchBox compact initialQuery={q}/>
    <div className="guide-category-nav" aria-label="Thema eingrenzen">
      <Link href={`/suche/${q?`?q=${encodeURIComponent(q)}`:""}`} aria-current={!category?"page":undefined}>Alle Themen</Link>
      {guideCategories.map(c=><Link key={c} href={`/suche/?${q?`q=${encodeURIComponent(q)}&`:""}category=${encodeURIComponent(c)}`} aria-current={category===c?"page":undefined}>{c}</Link>)}
    </div>
    {!products.length&&!guides.length ? <section className="empty-state"><Icon name="search"/><h2>Keine passenden Inhalte gefunden.</h2>
      <p>Probiere ein anderes Produkt oder Thema. Du kannst auch direkt in den Beauty-Produkten stöbern.</p>
      <Link href="/produkte/" className="button primary">Alle Beauty-Produkte <Icon name="arrow"/></Link></section>:null}
    {products.length>0 && <section className="search-products">
      <div className="section-heading"><div><span className="eyebrow">ECHTE HÄNDLERPRODUKTE</span><h2>Beauty-Produkte ({products.length})</h2>
        <p>Werbelinks zu bdr-beauty DE. Preise laut Feed, aktuelle Angaben beim Händler.</p></div>
        <Link href="/produkte/" className="text-link">Zum Beauty-Katalog <Icon name="arrow"/></Link></div>
      <div className="affiliate-grid">
        {products.slice(0,q?63:6).map(product=><AffiliateProductCard key={product.id} product={product}/>)}
      </div>
      {!q&&products.length>6&&<Link href="/produkte/" className="text-link search-see-more">Alle {products.length} Beauty-Produkte anzeigen <Icon name="arrow"/></Link>}
    </section>}
    {guides.length>0 && <section className="search-guides">
      <div className="section-heading"><div><span className="eyebrow">EINKAUFSWISSEN</span><h2>Passende Ratgeber ({guides.length})</h2></div>
        <Link href="/ratgeber/" className="text-link">Alle Ratgeber <Icon name="arrow"/></Link></div>
      <div className="guides-grid">{guides.map(g=><GuideCard key={g.slug} guide={g}/>)}</div>
    </section>}
  </>;
}
