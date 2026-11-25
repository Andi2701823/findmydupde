import type {Metadata} from "next";
import Link from "next/link";
import {shoppingCategories,categoryPath} from "@/lib/shopping-categories";
import {BreadcrumbJsonLd} from "@/components/seo-jsonld";
export const metadata:Metadata={
 title:"Produktkategorien: Technik, Garten, Sicherheit & Beauty",
 description:"Entdecke Kaufkriterien für Smartphones, Notebooks, Fernseher, Mähroboter, Überwachungskameras und Gesichtspflege.",
 alternates:{canonical:"https://findmydup.de/kategorien/"}
};
export default function CategoriesPage(){
 return <main id="main" className="shell affiliate-page">
  <BreadcrumbJsonLd items={[{name:"Startseite",url:"https://findmydup.de/"},{name:"Produktkategorien",url:"https://findmydup.de/kategorien/"}]}/>
  <nav className="breadcrumb" aria-label="Brotkrumennavigation"><Link href="/">Startseite</Link><span>/</span> Produktkategorien</nav>
  <h1>Produktkategorien und Kaufkriterien</h1>
  <p className="affiliate-intro">Wähle ein Produktthema. Unsere Kaufhilfen erklären wichtige Unterschiede und führen zu passenden Händlerkatalogen, soweit verfügbar.</p>
  <div className="merchant-directory-grid">{shoppingCategories.map(c=><article className="article-tips" key={c.slug}><h2><Link href={categoryPath(c.slug)}>{c.name}</Link></h2><p>{c.description}</p><Link className="text-link" href={categoryPath(c.slug)}>Kaufkriterien für {c.name}</Link></article>)}</div>
  <p><Link href="/produkte/">Alle verfügbaren Händlerkataloge</Link> · <Link href="/ratgeber/">Einkaufsratgeber</Link></p>
 </main>;
}
