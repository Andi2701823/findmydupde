import type {Metadata} from "next";
import Link from "next/link";
import {notFound} from "next/navigation";
import {samsungCatalogEnabled,samsungCategories,sanitizeSamsungQuery,searchSamsungProducts,validSamsungCategory} from "@/lib/samsung-catalog";
import {SamsungProductCard} from "@/components/samsung-product-card";

export const dynamic="force-dynamic";
export const metadata:Metadata={
  title:"Samsung-Produkte entdecken | FindMyDup",
  description:"Samsung Shop DE: Smartphones, Tablets, Fernseher, Monitore und Zubehör aus dem Awin-Produktfeed. Suche und filtere nach Kategorien.",
  alternates:{canonical:"https://findmydup.de/samsung/"}
};
type Params={q?:string;category?:string;page?:string};
function link(q:string,category:string,page:number) {
  const p=new URLSearchParams();
  if(q)p.set("q",q);
  if(category)p.set("category",category);
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
  let results:Awaited<ReturnType<typeof searchSamsungProducts>>|null=null;
  try{results=await searchSamsungProducts({q,category,page});}catch{}
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
      <button className="button primary" type="submit">Anzeigen</button>
    </form>
    {results?<><p className="affiliate-result-count" role="status">{total} Samsung-Produkte gefunden</p>
      {results.products.length?<div className="affiliate-grid">{results.products.map(p=><SamsungProductCard key={p.aw_product_id} product={p}/>)}</div>
        :<p className="empty-state">Keine passenden Produkte gefunden. Bitte ändere deine Suche oder die Kategorie.</p>}
      <nav className="samsung-pagination" aria-label="Produktseiten">
        {page>1&&<Link href={link(q,category,page-1)} className="button secondary">← Vorherige</Link>}
        <span>Seite {page} von {maxPage}</span>
        {page<maxPage&&<Link href={link(q,category,page+1)} className="button secondary">Weitere Produkte →</Link>}
      </nav>
    </>:<p className="empty-state" role="status">Der Samsung-Produktfeed ist momentan nicht erreichbar. Bitte versuche es später erneut.</p>}
  </main>;
}
