import type {Metadata} from "next";
import Link from "next/link";
import {merchantCatalogMetadata} from "@/lib/seo-catalog";
import {imouModels,imouCategories,imouVariantCount,findImouModels} from "@/lib/imou-products";
import {ImouModelCard} from "@/components/imou-model-card";
import {BreadcrumbJsonLd} from "@/components/seo-jsonld";
export const dynamic="force-dynamic";
type Params={q?:string;category?:string;sort?:string;page?:string};
export async function generateMetadata({searchParams}:{searchParams:Promise<Record<string,string|string[]|undefined>>}):Promise<Metadata>{
 return merchantCatalogMetadata({
  title:"IMOU Kameras, Video-Türklingeln und Smart Home entdecken",
  description:"IMOU Überwachungskameras, Sicherheitssysteme und Zubehör aus dem Awin-Händlerfeed. Modellvarianten und historische Feedpreise vergleichen.",
  canonical:"https://findmydup.de/imou/",params:await searchParams
 });
}
function makeLink(f:{q:string;category:string;sort:string},page:number){
 const u=new URLSearchParams();
 if(f.q)u.set("q",f.q);
 if(f.category)u.set("category",f.category);
 if(f.sort!=="name")u.set("sort",f.sort);
 if(page>1)u.set("page",String(page));
 return "/imou/"+(u.size?"?"+u.toString():"");
}
export default async function ImouPage({searchParams}:{searchParams:Promise<Params>}){
 const p=await searchParams;
 const q=typeof p.q==="string"?p.q.trim().slice(0,80):"";
 const category=typeof p.category==="string"&&(imouCategories as readonly string[]).includes(p.category)?p.category:"";
 const sort=p.sort==="price-asc"||p.sort==="price-desc"?p.sort:"name";
 const parsed=Number(p.page||"1"),page=Number.isInteger(parsed)&&parsed>=1?Math.min(parsed,100):1;
 const models=findImouModels(q,category);
 models.sort((a,b)=>sort==="price-asc"?a.minPriceCents-b.minPriceCents||a.name.localeCompare(b.name,"de"):
  sort==="price-desc"?b.minPriceCents-a.minPriceCents||a.name.localeCompare(b.name,"de"):a.name.localeCompare(b.name,"de"));
 const perPage=24,pages=Math.max(1,Math.ceil(models.length/perPage));
 const visible=models.slice((page-1)*perPage,page*perPage);
 const filters={q,category,sort};
 return <main id="main" className="shell affiliate-page samsung-catalog-page imou-page">
  <BreadcrumbJsonLd items={[{name:"Startseite",url:"https://findmydup.de/"},{name:"Produktkatalog",url:"https://findmydup.de/produkte/"},{name:"IMOU",url:"https://findmydup.de/imou/"}]}/>
  <nav className="breadcrumb" aria-label="Brotkrumennavigation"><Link href="/">Startseite</Link><span>/</span><Link href="/produkte/">Produktkatalog</Link><span>/</span> IMOU</nav>
  <span className="eyebrow">IMOU DE · AWIN PARTNER</span>
  <h1>IMOU Überwachungskameras und Smart Home entdecken</h1>
  <p className="affiliate-intro">Entdecke {imouModels.length} Produktgruppen mit {imouVariantCount} Varianten: Überwachungskameras, Video-Türklingeln, Kamerasets und Zubehör. Die Produkte sind nach Modellen gebündelt, statt jede Speicherkarten- oder Auflösungsvariante auf einer eigenen SEO-Seite aufzuführen.</p>
  <aside className="affiliate-disclosure-box"><strong>Preise und Werbelinks</strong>
   <p>Alle Beträge und Produktinformationen stammen aus einem bereitgestellten Awin-Feed vom 16.10.2026. Sie sind Momentaufnahmen und werden nicht live abgefragt. Verfügbarkeit, Kamera-Ausführung, Lieferumfang und endgültige Preise bitte beim IMOU-Shop prüfen. Bei einem Kauf über unsere gekennzeichneten Werbelinks können wir eine Provision erhalten. Die Herstellerangaben sind keine unabhängigen Produkttests.</p>
  </aside>
  <form className="affiliate-controls samsung-controls" method="get" action="/imou/">
   <label>Produkt suchen<input name="q" type="search" maxLength={80} defaultValue={q} placeholder="z. B. Ranger, Cruiser, Türklingel"/></label>
   <label>Kategorie<select name="category" defaultValue={category}><option value="">Alle Kategorien</option>
    {imouCategories.map(c=><option key={c} value={c}>{c}</option>)}
   </select></label>
   <label>Sortieren<select name="sort" defaultValue={sort}><option value="name">Produktname</option><option value="price-asc">Ab günstigstem Preis</option><option value="price-desc">Ab höchstem Preis</option></select></label>
   <button className="button primary" type="submit">Filter anwenden</button><Link href="/imou/" className="button secondary">Zurücksetzen</Link>
  </form>
  <p role="status" className="affiliate-result-count">{models.length} Produktgruppen gefunden · Seite {page} von {pages}</p>
  {visible.length?<div className="affiliate-grid">{visible.map(m=><ImouModelCard key={m.id} model={{slug:m.slug,name:m.name,category:m.category,image:m.image,minPriceCents:m.minPriceCents,variantCount:m.variants.length}}/>)}</div>:
   <p className="empty-state">Keine passenden IMOU-Produkte gefunden. Bitte ändere deine Suche.</p>}
  <nav className="samsung-pagination" aria-label="IMOU Produktseiten">
   {page>1&&<Link href={makeLink(filters,page-1)} className="button secondary">← Vorherige</Link>}
   <span>Seite {page} von {pages}</span>
   {page<pages&&<Link href={makeLink(filters,page+1)} className="button secondary">Weitere Produkte →</Link>}
  </nav>
 </main>;
}
