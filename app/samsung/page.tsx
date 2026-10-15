import type {Metadata} from "next";
import Link from "next/link";
import {notFound} from "next/navigation";
import {samsungCatalogEnabled,samsungCategories,sanitizeSamsungQuery,searchSamsungProducts,validSamsungCategory} from "@/lib/samsung-catalog";
import {SamsungProductCard} from "@/components/samsung-product-card";
import {parseEuroCents,samsungSort,validPriceRange} from "@/lib/samsung-filters";

export const dynamic="force-dynamic";
export const metadata:Metadata={
  title:"Samsung-Produkte entdecken | FindMyDup",
  description:"Samsung Shop DE: Smartphones, Tablets, Fernseher, Monitore und Zubehör aus dem Awin-Produktfeed. Suche und filtere nach Kategorien.",
  alternates:{canonical:"https://findmydup.de/samsung/"}
};
type Params={q?:string;category?:string;page?:string;min?:string;max?:string;sort?:string};
function link(q:string,category:string,min:string,max:string,sort:string,page:number) {
  const p=new URLSearchParams();
  if(q)p.set("q",q);
  if(category)p.set("category",category);
  if(min)p.set("min",min);
  if(max)p.set("max",max);
  if(sort!=="name")p.set("sort",sort);
  if(page>1)p.set("page",String(page));
  const qs=p.toString();return "/samsung/"+(qs?"?"+qs:"");
}
export default async function SamsungCatalog({searchParams}:{searchParams:Promise<Params>}) {
  if(!samsungCatalogEnabled())notFound();
  const params=await searchParams;
  const q=sanitizeSamsungQuery(typeof params.q==="string"?params.q:"");
  const category=typeof params.category==="string"&&validSamsungCategory(params.category)?params.category:"";
  const requestedPage=Number(params.page||"1");
  const page=Number.isInteger(requestedPage)&&requestedPage>=1?Math.min(requestedPage,100):1;
  const min=typeof params.min==="string"?params.min.slice(0,12):"";
  const max=typeof params.max==="string"?params.max.slice(0,12):"";
  const minCents=parseEuroCents(min);
  const maxCents=parseEuroCents(max);
  const sort=samsungSort(typeof params.sort==="string"?params.sort:"");
  const invalidRange=!validPriceRange(minCents,maxCents);
  let results:Awaited<ReturnType<typeof searchSamsungProducts>>|null=null;
  if(!invalidRange)try{results=await searchSamsungProducts({q,category,page,minCents,maxCents,sort});}catch{}
  const total=results?.total||0;
  const maxPage=Math.max(1,Math.ceil(total/24));
  return <main id="main" className="shell affiliate-page samsung-catalog-page">
    <nav className="breadcrumb"><Link href="/">Startseite</Link><span>/</span><Link href="/produkte/">Produktkatalog</Link><span>/</span> Samsung</nav>
    <span className="eyebrow">AUS DEM AWIN-PRODUKTDATENFEED</span>
    <h1>Samsung-Produkte entdecken.</h1>
    <p className="affiliate-intro">Smartphones, Fernseher, Tablets, Monitore und Zubehör direkt aus dem Samsung Shop DE Feed. Nutze die Suche und die Hauptkategorien, ohne dich durch hunderte Unterseiten klicken zu müssen.</p>
    <aside className="affiliate-disclosure-box"><strong>Preise und Affiliate-Transparenz</strong>
      <p>Die angezeigten Artikel- und Versandpreise stammen aus einem importierten Awin-Feed und werden hier nicht live aktualisiert. Angebote und Verfügbarkeit können sich ändern. Die Shop-Links sind Werbelinks. FindMyDup verkauft die Produkte nicht selbst und garantiert weder gleiche Modelle noch Preisvorteile gegenüber anderen Angeboten.</p>
    </aside>
    <form className="affiliate-controls samsung-controls" method="get" action="/samsung/">
      <label>Produkt suchen
        <input type="search" name="q" defaultValue={q} maxLength={80} placeholder="z. B. Galaxy S26, OLED TV, SSD"/>
      </label>
      <label>Kategorie
        <select name="category" defaultValue={category}><option value="">Alle Kategorien</option>{samsungCategories.map(c=><option value={c} key={c}>{c}</option>)}</select>
      </label>
      <label>Preis ab (€)
        <input type="number" inputMode="decimal" name="min" defaultValue={min} min="0" max="20000" step="0.01" placeholder="Min."/>
      </label>
      <label>Preis bis (€)
        <input type="number" inputMode="decimal" name="max" defaultValue={max} min="0" max="20000" step="0.01" placeholder="Max."/>
      </label>
      <label>Sortieren
        <select name="sort" defaultValue={sort}>
          <option value="name">Produktname</option>
          <option value="price-asc">Preis: günstigste zuerst</option>
          <option value="price-desc">Preis: teuerste zuerst</option>
        </select>
      </label>
      <button className="button primary" type="submit">Filter anwenden</button>
      <Link href="/samsung/" className="button secondary">Zurücksetzen</Link>
    </form>
    {invalidRange&&<p className="empty-state" role="alert">Der Mindestpreis darf nicht über dem Höchstpreis liegen.</p>}
    {results?<><p className="affiliate-result-count" role="status">{total} Samsung-Produkte gefunden</p>
      {results.products.length?<div className="affiliate-grid">{results.products.map(p=><SamsungProductCard key={p.aw_product_id} product={p}/>)}</div>
        :<p className="empty-state">Keine passenden Produkte gefunden. Bitte ändere deine Suche oder die Kategorie.</p>}
      <nav className="samsung-pagination" aria-label="Produktseiten">
        {page>1&&<Link href={link(q,category,min,max,sort,page-1)} className="button secondary">← Vorherige</Link>}
        <span>Seite {page} von {maxPage}</span>
        {page<maxPage&&<Link href={link(q,category,min,max,sort,page+1)} className="button secondary">Weitere Produkte →</Link>}
      </nav>
    </>:!invalidRange&&<p className="empty-state" role="status">Der Samsung-Produktfeed ist momentan nicht erreichbar. Bitte versuche es später erneut.</p>}
  </main>;
}
