import type {Metadata} from "next";
import Link from "next/link";
import {notFound} from "next/navigation";
import {shoppingCategories,categoryPath,findShoppingCategory,type MerchantKey} from "@/lib/shopping-categories";
import {guides} from "@/lib/guides";
import {BreadcrumbJsonLd} from "@/components/seo-jsonld";
import {samsungCatalogEnabled} from "@/lib/samsung-catalog";
import {mactradeCatalogEnabled} from "@/lib/mactrade-catalog";
import {joybuyCatalogEnabled} from "@/lib/joybuy-catalog";
import {anthbotProducts,anthbotProductPath} from "@/lib/anthbot-products";
import {imouModels,imouModelPath} from "@/lib/imou-products";
import {affiliateProducts,affiliateProductPath} from "@/lib/affiliate-products";
export const dynamic="force-dynamic";
export const dynamicParams=false;
export function generateStaticParams(){return shoppingCategories.map(c=>({slug:c.slug}));}
const merchants:Record<MerchantKey,{name:string;href:string;enabled:()=>boolean}>={
 anthbot:{name:"ANTHBOT Mähroboter und Zubehör",href:"/anthbot/",enabled:()=>true},
 imou:{name:"IMOU Kameras und Smart Home",href:"/imou/",enabled:()=>true},
 samsung:{name:"Samsung Produktkatalog",href:"/samsung/",enabled:samsungCatalogEnabled},
 mactrade:{name:"MacTrade Apple-Produkte",href:"/mactrade/",enabled:mactradeCatalogEnabled},
 joybuy:{name:"JoyBuy Produktkatalog",href:"/joybuy/",enabled:joybuyCatalogEnabled},
 beauty:{name:"bdr-beauty Hautpflegeprodukte",href:"/produkte/#beauty-catalog-heading",enabled:()=>true}
};
export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{
 const {slug}=await params;const c=findShoppingCategory(slug);
 if(!c)return {title:"Kategorie nicht gefunden",robots:{index:false,follow:true}};
 const url="https://findmydup.de"+categoryPath(c.slug);
 return {title:c.title,description:c.description,alternates:{canonical:url},openGraph:{title:c.title,description:c.description,url,type:"website"},twitter:{card:"summary_large_image",title:c.title,description:c.description,images:["https://findmydup.de/share-image/"]}};
}
export default async function CategoryPage({params}:{params:Promise<{slug:string}>}){
 const {slug}=await params;const c=findShoppingCategory(slug);if(!c)notFound();
 const available=c.merchants.map(key=>merchants[key]).filter(m=>m.enabled());
 const related=guides.filter(g=>c.guideSlugs.includes(g.slug));
 const products=c.slug==="maehroboter"?anthbotProducts.filter(p=>p.category==="Mähroboter").slice(0,3).map(p=>({name:p.name,href:anthbotProductPath(p)})):
 c.slug==="ueberwachungskameras"?imouModels.filter(p=>p.category==="Überwachungskameras").slice(0,3).map(p=>({name:p.name,href:imouModelPath(p)})):
 c.slug==="gesichtspflege"?affiliateProducts.filter(p=>p.category==="Gesichtspflege").slice(0,3).map(p=>({name:p.name,href:affiliateProductPath(p)})):[];
 return <main id="main" className="shell affiliate-page">
  <BreadcrumbJsonLd items={[{name:"Startseite",url:"https://findmydup.de/"},{name:"Produktkategorien",url:"https://findmydup.de/kategorien/"},{name:c.name,url:"https://findmydup.de"+categoryPath(c.slug)}]}/>
  <nav className="breadcrumb" aria-label="Brotkrumennavigation"><Link href="/">Startseite</Link><span>/</span><Link href="/kategorien/">Produktkategorien</Link><span>/</span>{c.name}</nav>
  <article className="guide-article">
   <h1>{c.title}</h1><p className="article-lead">{c.intro}</p>
   {c.sections.map(s=><section className="article-section" key={s.heading}><h2>{s.heading}</h2><p>{s.text}</p></section>)}
   <section className="article-tips"><h2>Checkliste vor dem Kauf</h2><ul>{c.checklist.map(t=><li key={t}>{t}</li>)}</ul></section>
  </article>
  <section className="article-section"><h2>Passende Händlerkataloge</h2>
   {available.length>0?<ul>{available.map(m=><li key={m.href}><Link href={m.href}>{m.name}</Link></li>)}</ul>:<p>Aktuell ist kein spezialisierter Händlerkatalog für dieses Thema aktiviert. Nutze unsere <Link href="/suche/">Produktsuche</Link> oder informiere dich mit der Checkliste.</p>}
   <p>Die verlinkten Kataloge können weitere Kategorien enthalten. Preise und Verfügbarkeit bitte direkt beim Händler prüfen. Die Auswahl ist kein unabhängiger Produkttest.</p>
  </section>
  {products.length>0&&<section className="article-section"><h2>Ausgewählte Modelle und Produkte</h2><ul>{products.map(p=><li key={p.href}><Link href={p.href}>{p.name}</Link></li>)}</ul><p>Beispiele aus unseren Händlerfeeds, keine Rangliste oder Kaufempfehlung.</p></section>}
  {related.length>0&&<section className="article-section"><h2>Passende Ratgeber</h2><ul>{related.map(g=><li key={g.slug}><Link href={"/ratgeber/"+g.slug+"/"}>{g.title}</Link></li>)}</ul></section>}
  <section className="article-section"><h2>Weitere Produktkategorien</h2><ul>{shoppingCategories.filter(x=>x.slug!==c.slug).map(x=><li key={x.slug}><Link href={categoryPath(x.slug)}>{x.name}</Link></li>)}</ul></section>
 </main>;
}
