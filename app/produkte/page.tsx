import type { Metadata } from "next";
import Link from "next/link";
import { AffiliateProductList } from "@/components/affiliate-product-list";
import { samsungCatalogEnabled } from "@/lib/samsung-catalog";
import { joybuyCatalogEnabled } from "@/lib/joybuy-catalog";
import { mactradeCatalogEnabled } from "@/lib/mactrade-catalog";
export const dynamic="force-dynamic";
export const metadata:Metadata={
  title:"Produktkatalog: Angebote und Produkte entdecken",
  description:"Produkte aus echten Händlerfeeds entdecken, mit Suchfiltern, Awin-Händlerlinks und transparenten Feedpreisen.",
  alternates:{canonical:"https://findmydup.de/produkte/"},
};
export default function ProductsPage(){
  return <main id="main" className="shell affiliate-page">
    <nav className="breadcrumb" aria-label="Brotkrumennavigation"><Link href="/">Startseite</Link><span>/</span> Produktkatalog</nav>
    <span className="eyebrow">PRODUKTE NACH HÄNDLERN ENTDECKEN</span>
    <h1>Unser Produktkatalog.</h1>
    <p className="affiliate-intro">Entdecke Produkte aus unseren Händlerfeeds. {mactradeCatalogEnabled()?"Bei MacTrade findest du Apple-Produkte und Zubehör mit Suche und Filtern. Weitere Händlerkataloge und Beauty-Produkte stehen je nach Freischaltung bereit.":joybuyCatalogEnabled()?"Mit JoyBuy und Samsung findest du Produkte aus verschiedenen Kategorien. Darunter kannst du Beauty-Produkte von bdr-beauty entdecken.":samsungCatalogEnabled()?"Im Samsung-Katalog findest du Technik und Zubehör mit Suche und Preisfiltern. Darunter kannst du Beauty-Produkte durchsuchen.":"Durchsuche zunächst unser Beauty-Sortiment von bdr-beauty nach Kategorien und Produktnamen."}</p>
    <aside className="affiliate-disclosure-box"><strong>Transparenzhinweis</strong>
      <p>Diese Seite enthält Werbelinks (Affiliate-Links). Bei einem Kauf können wir eine Provision erhalten. Die angezeigten Beträge sind <strong>Feedpreise und keine live geprüften Angebote</strong>. Verbindlich sind die Angaben im jeweiligen Shop. Ähnliche Namen oder Verpackungen bedeuten nicht identische Produkte.</p>
    </aside>
    <section className="digital-tool-tile digital-tool-promo" aria-labelledby="digital-tools-catalog-heading">
      <div className="digital-tool-mark" aria-hidden="true">FC</div>
      <div>
        <span className="eyebrow">DIGITALE TOOLS · SOFTWARE</span>
        <h2 id="digital-tools-catalog-heading">FunnelCockpit – Marketing-Software</h2>
        <p>Website- und Funnel-Builder, Mitgliederbereiche und Marketing-Werkzeuge. Software-Abo, separat von unserem Preisvergleich für physische Produkte.</p>
        <Link href="/digitale-tools/funnelcockpit/" className="button secondary">Funktionen und Tarife ansehen →</Link>
      </div>
    </section>
    {mactradeCatalogEnabled()&&<section className="editorial-contact samsung-catalog-cta" aria-labelledby="mactrade-catalog-heading">
      <span className="eyebrow">MACTRADE DE · AWIN</span>
      <h2 id="mactrade-catalog-heading">MacTrade, Apple-Produkte und Zubehör</h2>
      <p>MacBooks, Desktop-Macs, iPhones, iPads und Zubehör mit Preis- und Kategorie-Filtern. Preise und Lieferstatus stammen aus einem Händlerfeed.</p>
      <Link href="/mactrade/" className="button secondary">Zum MacTrade-Katalog →</Link>
    </section>}
    {joybuyCatalogEnabled()&&<section className="editorial-contact samsung-catalog-cta" aria-labelledby="joybuy-catalog-heading">
      <span className="eyebrow">JOYBUY DE · AWIN</span>
      <h2 id="joybuy-catalog-heading">JoyBuy – Produkte aus vielen Kategorien</h2>
      <p>Beauty, Haushalt, Lebensmittel, Technik, Spielzeug und vieles mehr. Durchsuche die lieferbaren Feedangebote mit Preis-, Kategorie- und Markenfiltern.</p>
      <Link href="/joybuy/" className="button secondary">Zum JoyBuy-Katalog →</Link>
    </section>}
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
