import type { Metadata } from "next";
import Link from "next/link";
import { AffiliateProductList } from "@/components/affiliate-product-list";
import {MerchantDirectoryCard} from "@/components/merchant-directory-card";
import {PartnerBannerRotation} from "@/components/partner-banner-rotation";
import { samsungCatalogEnabled } from "@/lib/samsung-catalog";
import { joybuyCatalogEnabled } from "@/lib/joybuy-catalog";
import { mactradeCatalogEnabled } from "@/lib/mactrade-catalog";
import {anthbotProducts} from "@/lib/anthbot-products";
import {imouModels,imouVariantCount} from "@/lib/imou-products";
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
    <p className="affiliate-intro">Entdecke unsere Awin-Händler auf einen Blick und wähle die passende Produktsuche. In den einzelnen Händlerkatalogen kannst du das Sortiment nach Modell, Kategorie oder Preis eingrenzen.</p>
    <aside className="affiliate-disclosure-box"><strong>Transparenzhinweis</strong>
      <p>Diese Seite enthält Werbelinks (Affiliate-Links). Bei einem Kauf können wir eine Provision erhalten. Die angezeigten Beträge sind <strong>Feedpreise und keine live geprüften Angebote</strong>. Verbindlich sind die Angaben im jeweiligen Shop. Ähnliche Namen oder Verpackungen bedeuten nicht identische Produkte.</p>
    </aside>
    <section aria-labelledby="merchant-directory-heading" className="merchant-directory">
      <div className="merchant-directory-heading">
        <span className="eyebrow">ALLE HÄNDLER AUF EINEN BLICK</span>
        <h2 id="merchant-directory-heading">Unsere Händler entdecken</h2>
        <p>Wähle einen Shop und durchsuche dessen Angebot. Preise stammen aus Händlerfeeds und sind keine Live-Angebote.</p>
      </div>
      <div className="merchant-directory-grid">
        <MerchantDirectoryCard label="IMOU DE · AWIN" name="IMOU"
          description={imouModels.length+" Modellgruppen mit "+imouVariantCount+" Varianten: Kameras, Sicherheit und Smart Home."}
          href="/imou/" action="IMOU entdecken" accent="imou"/>
        <MerchantDirectoryCard label="ANTHBOT DE · AWIN" name="ANTHBOT"
          description={anthbotProducts.length+" Mähroboter- und Zubehörvarianten für den Garten."}
          href="/anthbot/" action="ANTHBOT entdecken" accent="anthbot"/>
        {mactradeCatalogEnabled()&&<MerchantDirectoryCard label="MACTRADE DE · AWIN" name="MacTrade"
          description="MacBooks, iPhones, iPads, Desktop-Macs und Zubehör mit eigenen Produktfiltern."
          href="/mactrade/" action="MacTrade entdecken" accent="mactrade"/>}
        {joybuyCatalogEnabled()&&<MerchantDirectoryCard label="JOYBUY DE · AWIN" name="JoyBuy"
          description="Technik, Haushalt, Beauty, Spielzeug und weitere Produktkategorien."
          href="/joybuy/" action="JoyBuy entdecken" accent="joybuy"/>}
        {samsungCatalogEnabled()&&<MerchantDirectoryCard label="SAMSUNG SHOP DE · AWIN" name="Samsung"
          description="Smartphones, Fernseher, Tablets und Zubehör aus dem Samsung-Shop."
          href="/samsung/" action="Samsung entdecken" accent="samsung"/>}
        <MerchantDirectoryCard label="BDR-BEAUTY DE · AWIN" name="bdr-beauty"
          description="63 Beauty-Produkte: Gesichtspflege, Masken, Sonnenschutz und Sets."
          href="#beauty-catalog-heading" action="Beauty-Produkte ansehen" accent="beauty"/>
      </div>
    </section>
    <PartnerBannerRotation />
    <section className="digital-tool-tile digital-tool-promo" aria-labelledby="digital-tools-catalog-heading">
      <div className="digital-tool-mark" aria-hidden="true">FC</div>
      <div>
        <span className="eyebrow">DIGITALE TOOLS · SOFTWARE</span>
        <h2 id="digital-tools-catalog-heading">FunnelCockpit – Marketing-Software</h2>
        <p>Website- und Funnel-Builder, Mitgliederbereiche und Marketing-Werkzeuge. Software-Abo, separat von unserem Preisvergleich für physische Produkte.</p>
        <Link href="/digitale-tools/funnelcockpit/" className="button secondary">Funktionen und Tarife ansehen →</Link>
      </div>
    </section>
    <section aria-labelledby="beauty-catalog-heading">
      <span className="eyebrow">BDR-BEAUTY DE</span>
      <h2 id="beauty-catalog-heading">Beauty-Produkte entdecken</h2>
      <p className="affiliate-intro">63 Produkte von bdr-beauty mit Kategorie- und Namensfilter. Die Preise stammen aus einem älteren Awin-Feed.</p>
      <AffiliateProductList/>
    </section>
  </main>;
}
