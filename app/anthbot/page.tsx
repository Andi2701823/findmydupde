import type {Metadata} from "next";
import Link from "next/link";
import {merchantCatalogMetadata} from "@/lib/seo-catalog";
import {anthbotProducts,findAnthbotProducts,type AnthbotCategory} from "@/lib/anthbot-products";
import {AnthbotProductCard} from "@/components/anthbot-product-card";
import {BreadcrumbJsonLd} from "@/components/seo-jsonld";
export const dynamic="force-dynamic";
type Params={q?:string;category?:string;sort?:string};
export async function generateMetadata({searchParams}:{searchParams:Promise<Record<string,string|string[]|undefined>>}):Promise<Metadata>{
 return merchantCatalogMetadata({
  title:"ANTHBOT Mähroboter & Zubehör – Produkte und Preise",
  description:"ANTHBOT Mähroboter und Zubehör aus dem Awin-Händlerfeed entdecken, Varianten auswählen und angezeigte Feedpreise vergleichen.",
  canonical:"https://findmydup.de/anthbot/",
  params:await searchParams
 });
}
export default async function AnthbotPage({searchParams}:{searchParams:Promise<Params>}){
 const p=await searchParams;
 const q=typeof p.q==="string"?p.q.replace(/[<>]/g,"").trim().slice(0,80):"";
 const category:AnthbotCategory|""=p.category==="Mähroboter"||p.category==="Zubehör"?p.category:"";
 const sort=p.sort==="price-asc"||p.sort==="price-desc"?p.sort:"name";
 const products=[...findAnthbotProducts(q,category)];
 products.sort((a,b)=>sort==="price-asc"?a.priceCents-b.priceCents||a.name.localeCompare(b.name,"de"):
  sort==="price-desc"?b.priceCents-a.priceCents||a.name.localeCompare(b.name,"de"):a.name.localeCompare(b.name,"de"));
 const mowerCount=anthbotProducts.filter(x=>x.category==="Mähroboter").length;
 const accessoryCount=anthbotProducts.length-mowerCount;
 return <main id="main" className="shell affiliate-page samsung-catalog-page anthbot-page">
  <BreadcrumbJsonLd items={[{name:"Startseite",url:"https://findmydup.de/"},{name:"Produktkatalog",url:"https://findmydup.de/produkte/"},{name:"ANTHBOT",url:"https://findmydup.de/anthbot/"}]}/>
  <nav className="breadcrumb" aria-label="Brotkrumennavigation">
   <Link href="/">Startseite</Link><span>/</span><Link href="/produkte/">Produktkatalog</Link><span>/</span><span aria-current="page">ANTHBOT</span>
  </nav>
  <span className="eyebrow">ANTHBOT DE · AWIN PARTNER</span>
  <h1>ANTHBOT Mähroboter und Zubehör entdecken</h1>
  <p className="affiliate-intro">Entdecke ANTHBOT-Mähroboter, Zubehör und passende Varianten im deutschen Händlerfeed. Nutze die Produktsuche und sortiere nach Artikelpreis, um Angebote einzuordnen. Die dargestellten Varianten können sich in Ausstattung und Lieferumfang unterscheiden.</p>
  <aside className="affiliate-disclosure-box"><strong>Werbung und Preistransparenz</strong>
   <p>Diese Seite enthält Awin-Affiliate-Links. Wir können bei einem Kauf eine Provision erhalten. Alle Produktdaten und Artikelpreise stammen aus einem bereitgestellten Händlerfeed vom 16.10.2026 und werden hier nicht live überprüft. Das Sortiment wurde um Versandschutz, Geschenkkarten, Gebühren, reine Serviceangebote und nicht verfügbare Einträge bereinigt. Prüfe aktuelle Preise, Verfügbarkeit, Versand und genaue Modellvariante im ANTHBOT-Shop.</p>
  </aside>
  <form className="affiliate-controls samsung-controls" action="/anthbot/" method="get">
   <label>Produkt suchen<input type="search" name="q" maxLength={80} defaultValue={q} placeholder="z. B. Genie, Rasenmäher, Ersatzklingen"/></label>
   <label>Produktart<select name="category" defaultValue={category}><option value="">Alle Produkte</option><option value="Mähroboter">Mähroboter ({mowerCount})</option><option value="Zubehör">Zubehör ({accessoryCount})</option></select></label>
   <label>Sortierung<select name="sort" defaultValue={sort}><option value="name">Produktname</option><option value="price-asc">Preis: günstigste zuerst</option><option value="price-desc">Preis: teuerste zuerst</option></select></label>
   <button type="submit" className="button primary">Filter anwenden</button>
   <Link href="/anthbot/" className="button secondary">Zurücksetzen</Link>
  </form>
  <p className="affiliate-result-count" role="status">{products.length} ANTHBOT-Angebote gefunden · {mowerCount} Mähroboter-Varianten und {accessoryCount} Zubehör-Varianten insgesamt</p>
  {products.length>0?<div className="affiliate-grid">{products.map(item=><AnthbotProductCard key={item.id} product={item}/>)}</div>:
   <p className="empty-state">Keine passenden ANTHBOT-Produkte gefunden. Bitte ändere den Suchbegriff oder die Produktart.</p>}
 </main>;
}
