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
import { MactradeResults } from "./mactrade-results";
import { UnifiedOffers } from "./unified-offers";
import {matchesFunnelcockpit,funnelcockpit} from "@/lib/digital-tools";
export function Results({ ebaySearch = false, samsungSearch = false, joybuySearch = false, mactradeSearch = false }: { ebaySearch?: boolean; samsungSearch?: boolean; joybuySearch?: boolean; mactradeSearch?: boolean }){
  const params=useSearchParams();
  const q=(params.get("q")||"").trim().slice(0,120);
  const selectedSource=params.get("source")||"all";
  const source=["all","beauty","guides",...(ebaySearch?["ebay"]:[]),...(samsungSearch?["samsung"]:[]),...(joybuySearch?["joybuy"]:[]),...(mactradeSearch?["mactrade"]:[])].includes(selectedSource)?selectedSource:"all";
  const digital=source==="all"&&matchesFunnelcockpit(q);
  const combined=source==="all"&&q.length>=2&&!digital;
  const showBeauty=source==="all"||source==="beauty";
  const showGuides=source==="all"||source==="guides";
  const showEbay=ebaySearch&&(source==="all"||source==="ebay");
  const showSamsung=samsungSearch&&(source==="all"||source==="samsung");
  const showJoybuy=joybuySearch&&(source==="all"||source==="joybuy");
  const showMactrade=mactradeSearch&&(source==="all"||source==="mactrade");
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
      <p>Finde passende Angebote aus allen verfügbaren Quellen – die niedrigsten Artikelpreise stehen zuerst. Vergleiche Modell, Versand und Zustand vor dem Kauf.</p>
    </div>
    <SearchBox key={q+"|"+source} compact initialQuery={q} initialSource={source}/>
    {digital&&<section className="digital-search-match" aria-label="Digitales Software-Angebot">
      <span className="eyebrow">PASSENDES DIGITALES TOOL</span>
      <div className="digital-search-match-row">
        <div><h2>{funnelcockpit.name}</h2><p>{funnelcockpit.summary}</p>
          <span className="digital-search-type">{funnelcockpit.type} · kein Preisvergleich mit physischen Waren</span>
        </div>
        <Link className="button primary" href={funnelcockpit.path}>Funktionen und Tarife ansehen →</Link>
      </div>
      <p className="affiliate-disclosure">Transparenter Werbelink auf der Detailseite. Kein eigener Softwaretest.</p>
    </section>}
    {combined&&<UnifiedOffers key={q} query={q} beauty={findAffiliateProducts(q)} enabled={{samsung:samsungSearch,joybuy:joybuySearch,mactrade:mactradeSearch,ebay:ebaySearch}}/>}
    {!combined&&<nav className="search-source-filters" aria-label="Ergebnisse nach Quelle filtern">
      {[{id:"all",label:"Alle Quellen"},...(samsungSearch?[{id:"samsung",label:"Samsung Shop"}]:[]),...(joybuySearch?[{id:"joybuy",label:"JoyBuy"}]:[]),...(mactradeSearch?[{id:"mactrade",label:"MacTrade"}]:[]),...(ebaySearch?[{id:"ebay",label:"eBay"}]:[]),{id:"beauty",label:"Beauty-Produkte"},{id:"guides",label:"Ratgeber"}].map(item=>
        <Link key={item.id} href={sourceUrl(item.id)} aria-current={source===item.id?"page":undefined}>{item.label}</Link>
      )}
    </nav>}
    {!combined&&(source==="all"||source==="guides")&&<div className="guide-category-nav" aria-label="Thema eingrenzen">
      <Link href={"/suche/"+(q||source!=="all"?"?"+[q?"q="+encodeURIComponent(q):"",source!=="all"?"source="+encodeURIComponent(source):""].filter(Boolean).join("&"):"")} aria-current={!category?"page":undefined}>Alle Themen</Link>
      {guideCategories.map(c=>{
        const u=new URLSearchParams();
        if(q)u.set("q",q);
        if(source!=="all")u.set("source",source);
        u.set("category",c);
        return <Link key={c} href={"/suche/?"+u.toString()} aria-current={category===c?"page":undefined}>{c}</Link>;
      })}
    </div>}

    {!digital&&!combined&&!products.length&&!guides.length && !(showEbay && q.length >= 2) && !(showSamsung && q.length >= 2) && !(showJoybuy && q.length >= 2) && !(showMactrade && q.length >= 2) ? <section className="empty-state"><Icon name="search"/><h2>Keine passenden Inhalte gefunden.</h2>
      <p>Probiere ein anderes Produkt oder Thema. Du kannst auch direkt in den Beauty-Produkten stöbern.</p>
      <Link href="/produkte/" className="button primary">Alle Beauty-Produkte <Icon name="arrow"/></Link></section>:null}
    {!combined&&products.length>0 && <section className="search-products">
      <div className="section-heading"><div><span className="eyebrow">ECHTE HÄNDLERPRODUKTE</span><h2>Gefundene Produkte ({products.length})</h2>
        <p>Werbelinks zu bdr-beauty DE. Preise laut Feed, aktuelle Angaben beim Händler.</p></div>
        <Link href="/produkte/" className="text-link">Zum Produktkatalog <Icon name="arrow"/></Link></div>
      <div className="affiliate-grid">
        {products.slice(0,q?63:6).map(product=><AffiliateProductCard key={product.id} product={product}/>)}
      </div>
      {!q&&products.length>6&&<Link href="/produkte/" className="text-link search-see-more">Alle {products.length} Beauty-Produkte anzeigen <Icon name="arrow"/></Link>}
    </section>}
    {!combined&&showSamsung && q.length >= 2 && category !== "Beauty" && <SamsungResults key={q} query={q} />}
    {!combined&&showJoybuy && q.length >= 2 && <JoybuyResults key={q} query={q} />}
    {!combined&&showMactrade && q.length >= 2 && <MactradeResults key={q} query={q} />}
    {!combined&&showEbay && q.length >= 2 && <EbayResults query={q} />}
    {((source==="samsung"&&q.length<2)||(source==="ebay"&&q.length<2)||(source==="joybuy"&&q.length<2)||(source==="mactrade"&&q.length<2))&&<p className="empty-state" role="status">Bitte gib mindestens zwei Zeichen ein, um Händlerangebote zu suchen.</p>}
    {guides.length>0 && <section className="search-guides">
      <div className="section-heading"><div><span className="eyebrow">EINKAUFSWISSEN</span><h2>Passende Ratgeber ({guides.length})</h2></div>
        <Link href="/ratgeber/" className="text-link">Alle Ratgeber <Icon name="arrow"/></Link></div>
      <div className="guides-grid">{guides.map(g=><GuideCard key={g.slug} guide={g}/>)}</div>
    </section>}
  </>;
}
