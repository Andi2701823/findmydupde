import type {Metadata} from "next";
import {merchantCatalogMetadata} from "@/lib/seo-catalog";
import Link from "next/link";
import {notFound} from "next/navigation";
import {mactradeCatalogEnabled,searchMactradeProducts,mactradeCategories,validMactradeCategory,cleanMactradeSearch,mactradeSort,parseMactradeEuros} from "@/lib/mactrade-catalog";
import {MactradeProductCard} from "@/components/mactrade-product-card";
export const dynamic="force-dynamic";
export async function generateMetadata({searchParams}:{searchParams:Promise<Record<string,string|string[]|undefined>>}):Promise<Metadata>{
  return merchantCatalogMetadata({
    title:"MacTrade: MacBooks, iPhones und Zubehör",
    description:"MacTrade DE Produkte aus dem Awin-Produktfeed. Nach MacBooks, Desktop-Macs, iPhone, iPad, Watch und Zubehör suchen und filtern.",
    canonical:"https://findmydup.de/mactrade/",
    params:await searchParams
  });
}
type Params={q?:string;category?:string;min?:string;max?:string;sort?:string;page?:string};
function link(f:{q:string;category:string;min:string;max:string;sort:string},page:number) {
  const u=new URLSearchParams();
  for(const k of ["q","category","min","max","sort"] as const)if(f[k]&&(k!=="sort"||f[k]!=="name"))u.set(k,f[k]);
  if(page>1)u.set("page",String(page));
  return "/mactrade/"+(u.size?"?"+u.toString():"");
}
export default async function MactradeCatalog({searchParams}:{searchParams:Promise<Params>}) {
  if(!mactradeCatalogEnabled())notFound();
  const p=await searchParams;
  const q=cleanMactradeSearch(typeof p.q==="string"?p.q:"");
  const category=typeof p.category==="string"&&validMactradeCategory(p.category)?p.category:"";
  const min=typeof p.min==="string"?p.min.slice(0,12):"";
  const max=typeof p.max==="string"?p.max.slice(0,12):"";
  const minCents=parseMactradeEuros(min),maxCents=parseMactradeEuros(max);
  const invalidRange=minCents!==null&&maxCents!==null&&minCents>maxCents;
  const sort=mactradeSort(typeof p.sort==="string"?p.sort:"");
  const parsed=Number(p.page||"1");
  const page=Number.isInteger(parsed)&&parsed>=1?Math.min(parsed,200):1;
  const filters={q,category,min,max,sort};
  let data:Awaited<ReturnType<typeof searchMactradeProducts>>|null=null;
  if(!invalidRange)try{data=await searchMactradeProducts({q,category,minCents,maxCents,sort,page});}catch{}
  const total=data?.total||0;
  const pages=Math.max(1,Math.ceil(total/24));
  return <main id="main" className="shell affiliate-page mactrade-catalog-page">
    <nav className="breadcrumb" aria-label="Brotkrumennavigation"><Link href="/">Startseite</Link><span>/</span><Link href="/produkte/">Produktkatalog</Link><span>/</span>MacTrade</nav>
    <span className="eyebrow">MACTRADE DE · AWIN</span>
    <h1>MacTrade-Produkte entdecken.</h1>
    <p className="affiliate-intro">MacBooks, Desktop-Macs, iPhones, iPads, Apple Watch und Zubehör aus dem MacTrade-Händlerfeed. Suche nach Modell und filtere nach Preis oder Kategorie.</p>
    <aside className="affiliate-disclosure-box"><strong>Preise und Werbelinks</strong>
      <p>Artikelpreise, Versand und Lieferstatus stammen aus einem importierten Awin-Feed. Sie werden nicht live geprüft. Preis, Lieferzeit und Verfügbarkeit bitte direkt bei MacTrade kontrollieren. Die Händlerlinks sind Werbelinks, für die FindMyDup eine Provision erhalten kann. MacTrade ist ein Händler und nicht der offizielle Apple Online Store.</p>
    </aside>
    <form method="get" action="/mactrade/" className="affiliate-controls samsung-controls">
      <label>Produkt suchen<input type="search" name="q" maxLength={80} defaultValue={q} placeholder="z. B. MacBook Air, iPad Pro"/></label>
      <label>Kategorie<select name="category" defaultValue={category}><option value="">Alle Kategorien</option>{mactradeCategories.map(c=><option value={c} key={c}>{c}</option>)}</select></label>
      <label>Preis ab (€)<input type="number" name="min" min="0" max="100000" step="0.01" defaultValue={min} placeholder="Min."/></label>
      <label>Preis bis (€)<input type="number" name="max" min="0" max="100000" step="0.01" defaultValue={max} placeholder="Max."/></label>
      <label>Sortieren<select name="sort" defaultValue={sort}><option value="name">Produktname</option><option value="price-asc">Günstigster zuerst</option><option value="price-desc">Teuerster zuerst</option></select></label>
      <button type="submit" className="button primary">Filter anwenden</button>
      <Link href="/mactrade/" className="button secondary">Zurücksetzen</Link>
    </form>
    {invalidRange?<p role="alert" className="empty-state">Der Mindestpreis darf nicht höher als der Höchstpreis sein.</p>:
      data?<><p role="status" className="affiliate-result-count">{total} MacTrade-Produkte gefunden</p>
        {data.products.length?<div className="affiliate-grid">{data.products.map(x=><MactradeProductCard key={x.aw_product_id} product={x}/>)}</div>:
          <p className="empty-state">Keine passenden Produkte gefunden. Versuche andere Suchbegriffe oder Filter.</p>}
        <nav className="samsung-pagination" aria-label="Produktseiten">
          {page>1&&<Link href={link(filters,page-1)} className="button secondary">← Vorherige</Link>}
          <span>Seite {page} von {pages}</span>
          {page<pages&&<Link href={link(filters,page+1)} className="button secondary">Weitere Produkte →</Link>}
        </nav></>:
      <p className="empty-state" role="status">Der MacTrade-Katalog ist momentan nicht verfügbar.</p>}
  </main>;
}
