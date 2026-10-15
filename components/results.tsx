"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { searchGuides, guideCategories } from "@/lib/guides";
import { findAffiliateProducts } from "@/lib/affiliate-products";
import { SearchBox } from "./search-box";
import { GuideCard } from "./guide-card";
import { AffiliateProductCard } from "./affiliate-product-card";
import { Icon } from "./icon";
import { EbayResults } from "./ebay-results";
import { SamsungResults } from "./samsung-results";
import { JoybuyResults } from "./joybuy-results";
export function Results({ ebaySearch = false, samsungSearch = false, joybuySearch = false }: { ebaySearch?: boolean; samsungSearch?: boolean; joybuySearch?: boolean }){
  const params=useSearchParams();
  const q=(params.get("q")||"").trim().slice(0,120);
  const selectedSource=params.get("source")||"all";
  const source=["all","beauty","guides",...(ebaySearch?["ebay"]:[]),...(samsungSearch?["samsung"]:[]),...(joybuySearch?["joybuy"]:[])].includes(selectedSource)?selectedSource:"all";
  const showBeauty=source==="all"||source==="beauty";
  const showGuides=source==="all"||source==="guides";
  const showEbay=ebaySearch&&(source==="all"||source==="ebay");
  const showSamsung=samsungSearch&&(source==="all"||source==="samsung");
  const showJoybuy=joybuySearch&&(source==="all"||source==="joybuy");
  const categoryValue=params.get("category")||"";
  const category=guideCategories.find(c=>c===categoryValue);
  const guides=showGuides?searchGuides(q,category):[];
  const products=showBeauty&&(!category||category==="Beauty")?findAffiliateProducts(q):[];
  function sourceUrl(next:string){
    const u=new URLSearchParams();
    if(q)u.set("q",q);
    if(next!=="all")u.set("source",next);
    if(next===source&&(next==="all"||next==="guides")&&category)u.set("category",category);
    return "/suche/"+(u.size?"?"+u.toString():"");
  }
  return <>
    <nav className="breadcrumb" aria-label="Brotkrumennavigation"><Link href="/">Startseite</Link><span>/</span> Suche</nav>
    <div className="results-heading">
      <span className="eyebrow">PRODUKTE UND EINKAUFSWISSEN ENTDECKEN</span>
      <h1>{q?`Funde zu „${q}“`:category?`Entdecken: ${category}`:"Was möchtest du entdecken?"}</h1>
      <p>Suche echte Händlerprodukte in unserem wachsenden Katalog und entdecke passende Einkaufsratgeber. {joybuySearch ? "Entdecke JoyBuy-Angebote, Samsung, Beauty-Produkte und eBay-Treffer. Händler-Feedpreise sind nicht live geprüft." : samsungSearch ? "Neben dem Beauty-Katalog kannst du Samsung-Angebote und eBay-Treffer entdecken. Feedpreise werden nicht live abgefragt." : "Aktuell stammen die Katalogprodukte von bdr-beauty. Feedpreise werden nicht live abgefragt."}</p>
    </div>
    <SearchBox compact initialQuery={q} initialSource={source}/>
    <nav className="search-source-filters" aria-label="Ergebnisse nach Quelle filtern">
      {[{id:"all",label:"Alle Quellen"},...(samsungSearch?[{id:"samsung",label:"Samsung Shop"}]:[]),...(joybuySearch?[{id:"joybuy",label:"JoyBuy"}]:[]),...(ebaySearch?[{id:"ebay",label:"eBay"}]:[]),{id:"beauty",label:"Beauty-Produkte"},{id:"guides",label:"Ratgeber"}].map(item=>
        <Link key={item.id} href={sourceUrl(item.id)} aria-current={source===item.id?"page":undefined}>{item.label}</Link>
      )}
    </nav>
    {(source==="all"||source==="guides")&&<div className="guide-category-nav" aria-label="Thema eingrenzen">
      <Link href={"/suche/"+(q||source!=="all"?"?"+[q?"q="+encodeURIComponent(q):"",source!=="all"?"source="+encodeURIComponent(source):""].filter(Boolean).join("&"):"")} aria-current={!category?"page":undefined}>Alle Themen</Link>
      {guideCategories.map(c=>{
        const u=new URLSearchParams();
        if(q)u.set("q",q);
        if(source!=="all")u.set("source",source);
        u.set("category",c);
        return <Link key={c} href={"/suche/?"+u.toString()} aria-current={category===c?"page":undefined}>{c}</Link>;
      })}
    </div>}

    {!products.length&&!guides.length && !(showEbay && q.length >= 2) && !(showSamsung && q.length >= 2) && !(showJoybuy && q.length >= 2) ? <section className="empty-state"><Icon name="search"/><h2>Keine passenden Inhalte gefunden.</h2>
      <p>Probiere ein anderes Produkt oder Thema. Du kannst auch direkt in den Beauty-Produkten stöbern.</p>
      <Link href="/produkte/" className="button primary">Alle Beauty-Produkte <Icon name="arrow"/></Link></section>:null}
    {products.length>0 && <section className="search-products">
      <div className="section-heading"><div><span className="eyebrow">ECHTE HÄNDLERPRODUKTE</span><h2>Gefundene Produkte ({products.length})</h2>
        <p>Werbelinks zu bdr-beauty DE. Preise laut Feed, aktuelle Angaben beim Händler.</p></div>
        <Link href="/produkte/" className="text-link">Zum Produktkatalog <Icon name="arrow"/></Link></div>
      <div className="affiliate-grid">
        {products.slice(0,q?63:6).map(product=><AffiliateProductCard key={product.id} product={product}/>)}
      </div>
      {!q&&products.length>6&&<Link href="/produkte/" className="text-link search-see-more">Alle {products.length} Beauty-Produkte anzeigen <Icon name="arrow"/></Link>}
    </section>}
    {showSamsung && q.length >= 2 && category !== "Beauty" && <SamsungResults key={q} query={q} />}
    {showJoybuy && q.length >= 2 && <JoybuyResults key={q} query={q} />}
    {showEbay && q.length >= 2 && <EbayResults query={q} />}
    {((source==="samsung"&&q.length<2)||(source==="ebay"&&q.length<2)||(source==="joybuy"&&q.length<2))&&<p className="empty-state" role="status">Bitte gib mindestens zwei Zeichen ein, um Händlerangebote zu suchen.</p>}
    {guides.length>0 && <section className="search-guides">
      <div className="section-heading"><div><span className="eyebrow">EINKAUFSWISSEN</span><h2>Passende Ratgeber ({guides.length})</h2></div>
        <Link href="/ratgeber/" className="text-link">Alle Ratgeber <Icon name="arrow"/></Link></div>
      <div className="guides-grid">{guides.map(g=><GuideCard key={g.slug} guide={g}/>)}</div>
    </section>}
  </>;
}
