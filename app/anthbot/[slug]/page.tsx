import type {Metadata} from "next";
import Link from "next/link";
import {notFound} from "next/navigation";
import {
 anthbotProducts,anthbotProductPath,anthbotProductSlug,findAnthbotProductBySlug,
 anthbotFeedSnapshot,formatAnthbotPrice
} from "@/lib/anthbot-products";
import {AffiliateDetailImage} from "@/components/affiliate-detail-image";
import {AnthbotProductCard} from "@/components/anthbot-product-card";
import {BreadcrumbJsonLd,ProductInfoJsonLd} from "@/components/seo-jsonld";
import {Icon} from "@/components/icon";

export const dynamicParams=false;
export function generateStaticParams(){
 return anthbotProducts.map(p=>({slug:anthbotProductSlug(p)}));
}
export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{
 const {slug}=await params;
 const product=findAnthbotProductBySlug(slug);
 if(!product)return {title:"ANTHBOT Produkt nicht gefunden",robots:{index:false,follow:true}};
 const url="https://findmydup.de"+anthbotProductPath(product);
 const description=(product.name+" – Produktvariante, Herstellerinformationen und Awin-Feedpreis bei FindMyDup. Preis und Lieferumfang direkt bei ANTHBOT prüfen.").slice(0,160);
 return {
  title:product.name+" – ANTHBOT Produktdetails",
  description,
  alternates:{canonical:url},
  openGraph:{type:"website",title:product.name,description,url,images:[{url:product.image,alt:product.name}]},
  twitter:{card:"summary_large_image",title:product.name,description,images:[product.image]},
  robots:{index:true,follow:true}
 };
}
export default async function AnthbotProductPage({params}:{params:Promise<{slug:string}>}){
 const {slug}=await params;
 const product=findAnthbotProductBySlug(slug);
 if(!product)notFound();
 const url="https://findmydup.de"+anthbotProductPath(product);
 const isMower=product.category==="Mähroboter";
 const related=anthbotProducts.filter(p=>p.id!==product.id&&p.category===product.category).slice(0,3);
 return <main id="main" className="shell product-detail-page anthbot-product-detail">
  <BreadcrumbJsonLd items={[
   {name:"Startseite",url:"https://findmydup.de/"},
   {name:"ANTHBOT",url:"https://findmydup.de/anthbot/"},
   {name:product.name,url}
  ]}/>
  <ProductInfoJsonLd name={product.name} image={product.image} description={product.description} url={url}/>
  <nav className="breadcrumb" aria-label="Brotkrumennavigation">
   <Link href="/">Startseite</Link><span>/</span><Link href="/anthbot/">ANTHBOT</Link><span>/</span>
   <span aria-current="page">{product.name}</span>
  </nav>
  <section className="product-detail-hero">
   <AffiliateDetailImage src={product.image} alt={"ANTHBOT "+product.name}/>
   <div className="product-detail-main">
    <span className="eyebrow">ANTHBOT DE · {product.category.toUpperCase()}</span>
    <h1>{product.name}</h1>
    <p className="product-detail-intro">Diese Produktvariante stammt aus dem ANTHBOT-DE-Händlerfeed von Awin. Prüfe vor dem Kauf die genaue Ausführung und den Lieferumfang. Diese Seite ist kein unabhängiger Produkttest.</p>
    <div className="product-detail-price">
     <strong>{formatAnthbotPrice(product.priceCents)}</strong>
     <span>Preis laut Awin-Feed vom {anthbotFeedSnapshot} – <b>kein Live-Preis</b>. Preis, Verfügbarkeit und Versandkosten bitte im Shop prüfen.</span>
    </div>
    <a className="button primary product-detail-cta" href={product.affiliateUrl}
       target="_blank" rel="nofollow sponsored noopener noreferrer">
     Aktuellen Preis bei ANTHBOT prüfen <Icon name="arrow"/>
    </a>
    <p className="affiliate-disclosure">Werbung/Affiliate-Link: Bei einem Kauf können wir eine Provision erhalten. Der Händler bestimmt den endgültigen Preis.</p>
   </div>
  </section>
  <div className="product-detail-content">
   <article className="product-description">
    <span className="eyebrow">HERSTELLERINFORMATIONEN</span>
    <h2>Beschreibung der ausgewählten Variante</h2>
    <p>{product.description.trim()}{product.description.length>=250?"…":""}</p>
    <p className="product-source">Quelle: ANTHBOT DE, Awin-Händlerfeed vom {anthbotFeedSnapshot}. Textauszug aus Händlerangaben, nicht unabhängig auf Leistung oder Eigenschaften geprüft. Die vollständige Produktbeschreibung und technischen Daten findest du beim Händler.</p>
    <h2>Was bedeutet die Variantenauswahl?</h2>
    <p>Die angezeigte Ausführung wird über die individuelle Händler-Variantenkennung <strong>{product.id}</strong> zugeordnet. Produkte mit ähnlichem Namen können sich im Modell, Zubehör, Zustand oder Lieferumfang unterscheiden. Prüfe die Variantenbezeichnung auf der verlinkten Händlerseite.</p>
   </article>
   <aside className="product-advice">
    <span className="eyebrow">KAUFHILFE</span>
    <h2>{isMower?"Worauf bei einem Mähroboter achten?":"Passt das Zubehör zu deinem Mähroboter?"}</h2>
    <ul>
     {isMower?<>
      <li>Vergleiche die offiziell angegebene Flächenleistung mit Größe und Aufbau deines Gartens.</li>
      <li>Prüfe Navigation, Steigungsgrenzen, Hinderniserkennung und die Anforderungen der Installation beim Hersteller.</li>
      <li>Achte darauf, ob es sich um Neuware oder ein generalüberholtes Gerät handelt und welches Zubehör im Paket enthalten ist.</li>
      <li>Kontrolliere Garantie, Versand, Rückgabe und mögliche Zusatzkosten.</li>
     </>:<>
      <li>Gleiche die Modellbezeichnung und Generation mit deinem vorhandenen ANTHBOT-Gerät ab.</li>
      <li>Kontrolliere Abmessungen, Anzahl der Teile und exakten Lieferumfang.</li>
      <li>Prüfe Einbau- und Sicherheitshinweise sowie die tatsächliche Verfügbarkeit direkt beim Händler.</li>
     </>}
    </ul>
    <Link href="/anthbot/" className="text-link">Weitere ANTHBOT-Produkte vergleichen <Icon name="arrow"/></Link>
   </aside>
  </div>
  <section className="product-detail-notice">
   <h2>Preise und Informationen prüfen</h2>
   <p>FindMyDup zeigt eine ältere Momentaufnahme aus dem Awin-Produktfeed und verkauft die Produkte nicht selbst. Preis, Zustand, Modelleigenschaften, Lieferumfang und Verfügbarkeit können inzwischen abweichen. Aussagen des Herstellers ersetzen keine unabhängigen Tests.</p>
  </section>
  {related.length>0&&<section className="product-detail-related">
   <div className="section-heading">
    <div><span className="eyebrow">MEHR ANTHBOT ENTDECKEN</span><h2>Weitere Angebote aus {product.category}</h2></div>
    <Link href="/anthbot/" className="text-link">Alle ANTHBOT-Produkte <Icon name="arrow"/></Link>
   </div>
   <div className="affiliate-grid">{related.map(p=><AnthbotProductCard key={p.id} product={p}/>)}</div>
  </section>}
 </main>;
}
