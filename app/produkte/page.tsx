import type { Metadata } from "next";
import Link from "next/link";
import { AffiliateProductList } from "@/components/affiliate-product-list";
import { samsungCatalogEnabled } from "@/lib/samsung-catalog";
export const dynamic="force-dynamic";
export const metadata:Metadata={
  title:"Beauty-Produkte von bdr-beauty entdecken",
  description:"63 bdr-beauty Produkte entdecken: Produktbeschreibungen, Inhaltsstoff-Hinweise, Preisangaben aus dem Awin-Feed und transparente Händlerlinks.",
  alternates:{canonical:"https://findmydup.de/produkte/"},
};
export default function ProductsPage(){
  return <main id="main" className="shell affiliate-page">
    <div className="breadcrumb"><Link href="/">Startseite</Link><span>/</span> Beauty-Produkte</div>
    <span className="eyebrow">BEAUTY BEWUSST ENTDECKEN</span>
    <h1>Echte Beauty-Produkte. Direkt vom Händler.</h1>
    <p className="affiliate-intro">Entdecke das Produktsortiment unseres Affiliate-Partners bdr-beauty DE. Filtere nach Kategorien oder suche einen Produktnamen. Beim Klick auf „Zum Händler“ gelangst du über einen Awin-Werbelink zum jeweiligen Shop.</p>
    <aside className="affiliate-disclosure-box"><strong>Transparenzhinweis</strong>
      <p>Diese Seite enthält Werbelinks (Affiliate-Links). Bei einem Kauf können wir eine Provision erhalten, ohne dass dir dadurch zusätzliche Kosten entstehen müssen. Die angezeigten Beträge sind ältere Feedpreise, <strong>keine live geprüften Angebote</strong>. Verbindlich sind die Angaben im Shop. Ähnliche Namen oder Verpackungen bedeuten nicht identische Produkte oder Wirkungen.</p>
    </aside>
    {samsungCatalogEnabled()&&<section className="editorial-contact samsung-catalog-cta">
      <span className="eyebrow">NEU: SAMSUNG SHOP DE</span>
      <h2>Auch Samsung-Produkte entdecken.</h2>
      <p>Smartphones, Fernseher, Tablets und Zubehör im eigenen Katalog mit Suche, Filtern und transparenten Awin-Händlerlinks.</p>
      <Link href="/samsung/" className="button secondary">Zum Samsung-Katalog →</Link>
    </section>}
    <AffiliateProductList/>
  </main>;
}
