import type {Metadata} from "next";
import Link from "next/link";
import {notFound} from "next/navigation";
import {affiliateProducts,affiliateProductPath,affiliateProductSlug,findAffiliateProductBySlug,affiliateFeedImported,formatFeedPrice} from "@/lib/affiliate-products";
import {affiliateDescriptions} from "@/lib/affiliate-descriptions";
import {AffiliateDetailImage} from "@/components/affiliate-detail-image";
import {AffiliateProductCard} from "@/components/affiliate-product-card";
import {Icon} from "@/components/icon";
import {ProductInfoJsonLd} from "@/components/seo-jsonld";
export const dynamicParams=false;
export function generateStaticParams(){return affiliateProducts.map(p=>({slug:affiliateProductSlug(p)}));}
function seoDescription(name:string):string{
  const summary=`${name} von bdr-beauty: Details und Herstellerangaben, Preis aus dem Awin-Feed sowie Tipps für deinen Produktvergleich bei FindMyDup.`;
  return summary.length>158?summary.slice(0,155).replace(/\s+\S*$/,"")+"…":summary;
}
export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{
  const {slug}=await params;
  const product=findAffiliateProductBySlug(slug);
  if(!product)return {title:"Produkt nicht gefunden",robots:{index:false}};
  const url=`https://findmydup.de${affiliateProductPath(product)}`;
  const description=seoDescription(product.name);
  return {
    title:`${product.name} – Produktdetails & Kaufhinweise`,
    description,
    alternates:{canonical:url},
    openGraph:{type:"website",title:`${product.name} | FindMyDup`,description,url,images:[{url:product.image,alt:product.name}]},
    twitter:{card:"summary_large_image",title:`${product.name} | FindMyDup`,description,images:[product.image]},
    robots:{index:true,follow:true},
  };
}
const advice:Record<string,{title:string;items:string[];guide:string}>={
  "Gesichtspflege":{title:"Worauf du bei Gesichtspflege achten solltest",items:[
    "Vergleiche die vollständige Inhaltsstoffliste (INCI) und prüfe individuelle Unverträglichkeiten.",
    "Achte auf Füllmenge, empfohlene Anwendung und Kosten pro Milliliter.",
    "Ein Wirkversprechen des Herstellers ist kein unabhängiger Produkttest."
  ],guide:"gesichtsserum-vergleichen"},
  "Masken & Peelings":{title:"Worauf du bei Masken und Peelings achten solltest",items:[
    "Berücksichtige Inhaltsstoffe, Anwendungshäufigkeit und deinen persönlichen Hautzustand.",
    "Verschiedene Peeling-Arten und Masken erfüllen unterschiedliche Pflegezwecke.",
    "Lies vor der Anwendung die Hinweise des Herstellers und teste die Verträglichkeit vorsichtig."
  ],guide:"gesichtsserum-vergleichen"},
  "Sets & Kuren":{title:"Worauf du bei Pflege-Sets achten solltest",items:[
    "Prüfe den genauen Lieferumfang und die Füllmenge jedes enthaltenen Produkts.",
    "Vergleiche den Gesamtpreis mit den einzelnen Produkten, falls diese separat erhältlich sind.",
    "Beachte, ob die enthaltenen Schritte und Wirkstoffe in deine bestehende Pflegeroutine passen."
  ],guide:"gesichtsserum-vergleichen"},
  "Sonnenschutz":{title:"Worauf du bei Sonnenschutz achten solltest",items:[
    "Prüfe die konkrete LSF- und UVA-Kennzeichnung beim Hersteller.",
    "Achte auf die empfohlene Auftragsmenge und die Hinweise zum Nachcremen.",
    "Unterschiedliche Texturen und Produkteigenschaften können die Anwendung beeinflussen."
  ],guide:"sonnenschutz-kaufen"},
};
export default async function ProductDetailPage({params}:{params:Promise<{slug:string}>}){
  const {slug}=await params;
  const product=findAffiliateProductBySlug(slug);
  if(!product)notFound();
  const excerpt=affiliateDescriptions[product.id];
  const url=`https://findmydup.de${affiliateProductPath(product)}`;
  const related=affiliateProducts.filter(p=>p.id!==product.id&&p.category===product.category).slice(0,3);
  const hint=advice[product.category];
  // Only emit BreadcrumbList while the Awin feed is stale. Google's Product rich results
  // require a verified current Offer, review, or aggregateRating; we have none.
  const breadcrumbsLd={
    "@context":"https://schema.org",
    "@type":"BreadcrumbList",
    itemListElement:[
      {"@type":"ListItem",position:1,name:"Startseite",item:"https://findmydup.de/"},
      {"@type":"ListItem",position:2,name:"Beauty-Produkte",item:"https://findmydup.de/produkte/"},
      {"@type":"ListItem",position:3,name:product.name,item:url},
    ],
  };
  const breadcrumbsJson=JSON.stringify(breadcrumbsLd).replace(/</g,"\\u003c");
  return <main id="main" className="shell product-detail-page">
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html:breadcrumbsJson}}/>
    <ProductInfoJsonLd name={product.name} image={product.image} description={excerpt} url={url}/>
    <nav className="breadcrumb" aria-label="Brotkrumennavigation">
      <Link href="/">Startseite</Link><span>/</span>
      <Link href="/produkte/">Beauty-Produkte</Link><span>/</span><span aria-current="page">{product.name}</span>
    </nav>
    <section className="product-detail-hero">
      <AffiliateDetailImage src={product.image} alt={`${product.name} von bdr-beauty`}/>
      <div className="product-detail-main">
        <span className="eyebrow">{product.category.toUpperCase()} · BDR-BEAUTY</span>
        <h1>{product.name}</h1>
        <p className="product-detail-intro">Produktinformationen von unserem Awin-Partner bdr-beauty. Die Händlerangaben helfen bei der Einordnung, ersetzen aber keinen unabhängigen Produkttest.</p>
        <div className="product-detail-price">
          <strong>{formatFeedPrice(product.priceCents)}</strong>
          <span>Preis laut Feed vom {affiliateFeedImported} – <b>nicht live aktualisiert</b></span>
        </div>
        <a className="button primary product-detail-cta" href={product.affiliateUrl} rel="nofollow sponsored noopener noreferrer" target="_blank">
          Preis & Verfügbarkeit beim Händler prüfen <Icon name="arrow"/>
        </a>
        <p className="affiliate-disclosure">Werbelink (Affiliate-Link): Bei einem Kauf können wir eine Provision erhalten. Der Händler bestimmt den endgültigen Preis.</p>
      </div>
    </section>
    <div className="product-detail-content">
      <article className="product-description">
        <span className="eyebrow">PRODUKTINFORMATIONEN</span>
        <h2>Beschreibung & wichtige Hinweise</h2>
        <p>{excerpt}</p>
        <p className="product-source">Quelle: Produktbeschreibung des Händlers bdr-beauty DE aus dem Awin-Datenfeed. Die Angaben stammen vom Anbieter und wurden von FindMyDup nicht unabhängig auf Wirksamkeit geprüft. Aktuelle Produktdetails und die vollständige Inhaltsstoffliste findest du beim Händler.</p>
      </article>
      <aside className="product-advice">
        <span className="eyebrow">BEWUSST VERGLEICHEN</span>
        <h2>{hint.title}</h2>
        <ul>{hint.items.map(item=><li key={item}>{item}</li>)}</ul>
        <Link href={`/ratgeber/${hint.guide}/`} className="text-link">Passenden Einkaufsratgeber lesen <Icon name="arrow"/></Link>
      </aside>
    </div>
    <section className="product-detail-notice">
      <h2>Preise, Verfügbarkeit und Produktaussagen</h2>
      <p>Die gezeigten Produktdaten stammen aus einem älteren Awin-Feed. Preise, Verpackung, Zusammensetzung und Verfügbarkeit können inzwischen abweichen. Bitte prüfe vor dem Kauf die vollständige Händlerseite. Ähnliche Bezeichnungen oder Verpackungen sind kein Nachweis für gleiche Zusammensetzung oder Wirkung.</p>
    </section>
    {related.length>0&&<section className="product-detail-related">
      <div className="section-heading"><div><span className="eyebrow">MEHR ENTDECKEN</span><h2>Weitere Produkte aus {product.category}</h2></div>
        <Link href="/produkte/" className="text-link">Alle Beauty-Produkte <Icon name="arrow"/></Link></div>
      <div className="affiliate-grid">{related.map(p=><AffiliateProductCard key={p.id} product={p}/>)}</div>
    </section>}
  </main>;
}
