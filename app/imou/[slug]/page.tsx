import type {Metadata} from "next";
import Link from "next/link";
import {notFound} from "next/navigation";
import {imouModels,imouModelPath,findImouModelBySlug,imouFeedDate} from "@/lib/imou-products";
import {euroImou} from "@/lib/imou-prices";
import {AffiliateDetailImage} from "@/components/affiliate-detail-image";
import {ImouModelCard} from "@/components/imou-model-card";
import {BreadcrumbJsonLd} from "@/components/seo-jsonld";
import {Icon} from "@/components/icon";
export const dynamicParams=false;
export function generateStaticParams(){return imouModels.map(m=>({slug:m.slug}));}
export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{
 const {slug}=await params,model=findImouModelBySlug(slug);
 if(!model)return {title:"IMOU Produkt nicht gefunden",robots:{index:false,follow:true}};
 const url="https://findmydup.de"+imouModelPath(model);
 const description=(model.name+" – Kamera- und Produktvarianten aus dem IMOU-Awin-Feed entdecken. Historische Preise und Händlerangaben prüfen.").slice(0,160);
 return {
  title:model.name+" – IMOU Varianten im Überblick",
  description,alternates:{canonical:url},
  openGraph:{type:"website",url,title:model.name,description,images:[{url:model.image,alt:model.name}]},
  twitter:{card:"summary_large_image",title:model.name,description,images:[model.image]},
  robots:{index:true,follow:true}
 };
}
export default async function ImouDetail({params}:{params:Promise<{slug:string}>}){
 const {slug}=await params,model=findImouModelBySlug(slug);
 if(!model)notFound();
 const url="https://findmydup.de"+imouModelPath(model);
 const related=imouModels.filter(m=>m.id!==model.id&&m.category===model.category).slice(0,3);
 return <main id="main" className="shell product-detail-page imou-product-detail">
  <BreadcrumbJsonLd items={[{name:"Startseite",url:"https://findmydup.de/"},{name:"IMOU",url:"https://findmydup.de/imou/"},{name:model.name,url}]}/>
  <nav className="breadcrumb" aria-label="Brotkrumennavigation"><Link href="/">Startseite</Link><span>/</span><Link href="/imou/">IMOU</Link><span>/</span><span aria-current="page">{model.name}</span></nav>
  <section className="product-detail-hero">
   <AffiliateDetailImage src={model.image} alt={model.name}/>
   <div className="product-detail-main">
    <span className="eyebrow">IMOU DE · {model.category.toUpperCase()}</span>
    <h1>{model.name}</h1>
    <p className="product-detail-intro">Hier sind {model.variants.length} Varianten aus demselben IMOU-Händlerprodukt zusammengefasst. Die Varianten können sich bei Auflösung, Zubehör, Speicherkarte und Lieferumfang unterscheiden. Die Händlerangaben sind nicht unabhängig getestet.</p>
    <div className="product-detail-price">
     <strong>Ab {euroImou(model.minPriceCents)}</strong>
     <span>Niedrigster Artikelpreis der gelisteten Varianten aus dem Awin-Feed vom {imouFeedDate} – <b>nicht live geprüft</b>.</span>
    </div>
    <a className="button primary product-detail-cta" href="#varianten">Varianten und Werbelinks ansehen <Icon name="arrow"/></a>
   </div>
  </section>
  <div className="product-detail-content">
   <article className="product-description">
    <span className="eyebrow">ANGABEN DES HÄNDLERS</span>
    <h2>Modell und Eigenschaften</h2>
    <p>{model.description}</p>
    <p className="product-source">Quelle: IMOU DE, Awin-Datenfeed {imouFeedDate}. Gekürzte Herstellerbeschreibung ohne eigene Produkttests. Maßgeblich sind die vollständigen technischen Details, Preise und Lieferbedingungen beim Händler.</p>
   </article>
   <aside className="product-advice">
    <span className="eyebrow">VOR DEM KAUF PRÜFEN</span>
    <h2>Welche Ausführung passt?</h2>
    <ul>
     <li>Vergleiche die genaue Modellbezeichnung und Auflösung.</li>
     <li>Prüfe Speicherkarte, Stromversorgung, Lieferumfang und eventuelle Abokosten.</li>
     <li>Achte auf Netzwerk-Kompatibilität, Installation und die Herstellerhinweise.</li>
     <li>Kontrolliere Versandkosten, Garantie und den aktuellen Händlerpreis.</li>
    </ul>
    <Link href="/imou/" className="text-link">Weitere IMOU-Modelle entdecken <Icon name="arrow"/></Link>
   </aside>
  </div>
  <section id="varianten" className="product-detail-related" aria-label="Varianten und Händlerangebote">
   <div className="section-heading"><div>
    <span className="eyebrow">IMOU VARIANTEN · AWIN</span>
    <h2>{model.variants.length} Varianten und Händlerpreise</h2>
    <p>Die Artikelpreise sind eine ältere Momentaufnahme. Bitte prüfe vor einem Kauf Modell, Verfügbarkeit und endgültigen Preis beim Shop.</p>
   </div></div>
   <div className="imou-variant-list">
    {[...model.variants].sort((a,b)=>a.priceCents-b.priceCents||a.name.localeCompare(b.name,"de")).map(v=>
     <article className="imou-variant" key={v.id}>
      <div className="imou-variant-name"><strong>{v.name}</strong><small>Awin-Variante {v.id} · Preis aus Feed {imouFeedDate}</small></div>
      <strong className="imou-variant-price">{euroImou(v.priceCents)}</strong>
      <a href={v.affiliateUrl} target="_blank" rel="nofollow sponsored noopener noreferrer" className="button secondary">Beim Händler prüfen ↗</a>
     </article>
    )}
   </div>
   <p className="affiliate-disclosure">Werbelinks · Bei einem qualifizierten Einkauf können wir eine Provision erhalten. FindMyDup verkauft keine Produkte selbst.</p>
  </section>
  {related.length>0&&<section className="product-detail-related">
   <div className="section-heading"><div><span className="eyebrow">MEHR ENTDECKEN</span><h2>Weitere Produkte aus {model.category}</h2></div><Link href="/imou/" className="text-link">IMOU-Katalog <Icon name="arrow"/></Link></div>
   <div className="affiliate-grid">{related.map(m=><ImouModelCard key={m.id} model={{slug:m.slug,name:m.name,category:m.category,image:m.image,minPriceCents:m.minPriceCents,variantCount:m.variants.length}}/>)}</div>
  </section>}
 </main>;
}
