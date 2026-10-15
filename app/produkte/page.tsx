import type { Metadata } from "next";
import Link from "next/link";
import { AffiliateProductList } from "@/components/affiliate-product-list";
import { samsungCatalogEnabled } from "@/lib/samsung-catalog";
export const dynamic="force-dynamic";
export const metadata:Metadata={
  title:"Produktkatalog: Händlerprodukte entdecken | FindMyDup",
  description:"Produkte aus echten Händlerfeeds entdecken, mit Suchfiltern, Awin-Händlerlinks und transparenten Feedpreisen.",
  alternates:{canonical:"https://findmydup.de/produkte/"},
};
export default function ProductsPage(){
  return <main id="main" className="shell affiliate-page">
    <nav className="breadcrumb" aria-label="Brotkrumennavigation"><Link href="/">Startseite</Link><span>/</span> Produktkatalog</nav>
    <span className="eyebrow">PRODUKTE NACH HÄNDLERN ENTDECKEN</span>
    <h1>Unser Produktkatalog.</h1>
    <p className="affiliate-intro">Entdecke Produkte aus unseren Händlerfeeds. {samsungCatalogEnabled()?"Im Samsung-Katalog findest du Technik und Zubehör mit Suche und Preisfiltern. Darunter kannst du Beauty-Produkte durchsuchen.":"Durchsuche zunächst unser Beauty-Sortiment von bdr-beauty nach Kategorien und Produktnamen."}</p>
    <aside className="affiliate-disclosure-box"><strong>Transparenzhinweis</strong>
      <p>Diese Seite enthält Werbelinks (Affiliate-Links). Bei einem Kauf können wir eine Provision erhalten. Die angezeigten Beträge sind <strong>Feedpreise und keine live geprüften Angebote</strong>. Verbindlich sind die Angaben im jeweiligen Shop. Ähnliche Namen oder Verpackungen bedeuten nicht identische Produkte.</p>
    </aside>
    {samsungCatalogEnabled()&&<section className="editorial-contact samsung-catalog-cta" aria-labelledby="samsung-catalog-heading">
      <span className="eyebrow">NEU: SAMSUNG SHOP DE</span>
      <h2 id="samsung-catalog-heading">Samsung Shop DE – Technik &amp; Zubehör</h2>
      <p>Smartphones, Fernseher, Tablets und Zubehör im eigenen Katalog mit Suche, Filtern und transparenten Awin-Händlerlinks.</p>
      <Link href="/samsung/" className="button secondary">Zum Samsung-Katalog →</Link>
    </section>}
    <section aria-labelledby="beauty-catalog-heading">
      <span className="eyebrow">BDR-BEAUTY DE</span>
      <h2 id="beauty-catalog-heading">Beauty-Produkte entdecken</h2>
      <p className="affiliate-intro">63 Produkte von bdr-beauty mit Kategorie- und Namensfilter. Die Preise stammen aus einem älteren Awin-Feed.</p>
      <AffiliateProductList/>
    </section>
  </main>;
}
