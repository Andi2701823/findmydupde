import type {Metadata} from "next";
import Link from "next/link";
import {notFound} from "next/navigation";
import {joybuyCatalogEnabled,searchJoybuyProducts,joybuyCategories,validJoybuyCategory,cleanJoybuySearch,joybuySort,euroCents} from "@/lib/joybuy-catalog";
import {JoybuyProductCard} from "@/components/joybuy-product-card";
export const dynamic="force-dynamic";
export const metadata:Metadata={
  title:"JoyBuy-Produkte entdecken | FindMyDup",
  description:"JoyBuy DE Produkte aus dem Awin-Produktfeed: Beauty, Wohnen, Lebensmittel, Technik, Mode und mehr. Mit Filtern für Kategorien, Preise und Marke.",
  alternates:{canonical:"https://findmydup.de/joybuy/"}
};
type Params={q?:string;category?:string;brand?:string;min?:string;max?:string;sort?:string;page?:string};
function link(filters:{q:string;category:string;brand:string;min:string;max:string;sort:string},page:number){
  const u=new URLSearchParams();
  for(const k of ["q","category","brand","min","max","sort"] as const){
    if(filters[k]&&(k!=="sort"||filters[k]!=="name"))u.set(k,filters[k]);
  }
  if(page>1)u.set("page",String(page));
  return "/joybuy/"+(u.size?"?"+u.toString():"");
}
export default async function JoybuyCatalog({searchParams}:{searchParams:Promise<Params>}){
  if(!joybuyCatalogEnabled())notFound();
  const params=await searchParams;
  const q=cleanJoybuySearch(typeof params.q==="string"?params.q:"");
  const category=typeof params.category==="string"&&validJoybuyCategory(params.category)?params.category:"";
  const brand=cleanJoybuySearch(typeof params.brand==="string"?params.brand:"");
  const min=typeof params.min==="string"?params.min.slice(0,12):"";
  const max=typeof params.max==="string"?params.max.slice(0,12):"";
  const minCents=euroCents(min),maxCents=euroCents(max);
  const invalidRange=minCents!==null&&maxCents!==null&&minCents>maxCents;
  const sort=joybuySort(typeof params.sort==="string"?params.sort:"");
  const parsed=Number(params.page||"1");
  const page=Number.isInteger(parsed)&&parsed>0?Math.min(parsed,100):1;
  const filters={q,category,brand,min,max,sort};
  let data:Awaited<ReturnType<typeof searchJoybuyProducts>>|null=null;
  if(!invalidRange)try{data=await searchJoybuyProducts({q,category,brand,minCents,maxCents,sort,page});}catch{}
  const count=data?.total||0;
  const pages=Math.max(1,Math.ceil(count/24));
  return <main id="main" className="shell affiliate-page joybuy-catalog-page">
    <nav className="breadcrumb" aria-label="Brotkrumennavigation"><Link href="/">Startseite</Link><span>/</span><Link href="/produkte/">Produktkatalog</Link><span>/</span> JoyBuy</nav>
    <span className="eyebrow">JOYBUY DE · AWIN</span>
    <h1>JoyBuy-Produkte entdecken.</h1>
    <p className="affiliate-intro">Finde Produkte aus vielen Kategorien. Filtere nach Artikelname, Marke, Kategorie und Preis. Es werden nur ausgewählte, laut Feed lieferbare Angebote angezeigt.</p>
    <aside className="affiliate-disclosure-box"><strong>Preise &amp; Werbelinks</strong>
      <p>Preise, Lieferstatus und Versand stammen aus einem importierten Awin-Feed und werden hier nicht live überprüft. Verbindlich sind allein die aktuellen Angaben bei JoyBuy. Die Shop-Links sind Affiliate-Werbelinks; FindMyDup verkauft die Produkte nicht selbst.</p>
    </aside>
    <form method="get" action="/joybuy/" className="affiliate-controls samsung-controls">
      <label>Produkt suchen<input type="search" name="q" maxLength={80} defaultValue={q} placeholder="z. B. LEGO, Serum, Kopfhörer"/></label>
      <label>Kategorie<select name="category" defaultValue={category}><option value="">Alle Kategorien</option>{joybuyCategories.map(c=><option value={c} key={c}>{c}</option>)}</select></label>
      <label>Marke<input type="search" name="brand" defaultValue={brand} maxLength={80} placeholder="z. B. Philips"/></label>
      <label>Preis ab (€)<input type="number" name="min" defaultValue={min} min="0" max="20000" step="0.01" placeholder="Min."/></label>
      <label>Preis bis (€)<input type="number" name="max" defaultValue={max} min="0" max="20000" step="0.01" placeholder="Max."/></label>
      <label>Sortieren<select name="sort" defaultValue={sort}><option value="name">Produktname</option><option value="price-asc">Günstigster zuerst</option><option value="price-desc">Teuerster zuerst</option></select></label>
      <button type="submit" className="button primary">Filter anwenden</button>
      <Link href="/joybuy/" className="button secondary">Zurücksetzen</Link>
    </form>
    {invalidRange?<p className="empty-state" role="alert">Der Mindestpreis darf nicht höher als der Höchstpreis sein.</p>:
      data?<><p className="affiliate-result-count" role="status">{count} JoyBuy-Produkte gefunden</p>
        {data.products.length?<div className="affiliate-grid">{data.products.map(p=><JoybuyProductCard key={p.external_id} product={p}/>)}</div>:
          <p className="empty-state" role="status">Keine passenden Produkte gefunden. Versuche andere Filter.</p>}
        <nav className="samsung-pagination" aria-label="Produktseiten">
          {page>1&&<Link href={link(filters,page-1)} className="button secondary">← Vorherige</Link>}
          <span>Seite {page} von {pages}</span>
          {page<pages&&<Link href={link(filters,page+1)} className="button secondary">Weitere Produkte →</Link>}
        </nav></>:
      <p className="empty-state" role="status">Der JoyBuy-Katalog ist momentan nicht erreichbar. Bitte versuche es später erneut.</p>}
  </main>;
}
