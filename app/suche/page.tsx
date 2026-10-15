import { Suspense } from "react";
import type { Metadata } from "next";
import { Results } from "@/components/results";
import { ebaySearchEnabled } from "@/server/catalog/ebay-mode";
import { samsungCatalogEnabled } from "@/lib/samsung-catalog";
import { joybuyCatalogEnabled } from "@/lib/joybuy-catalog";
import { mactradeCatalogEnabled } from "@/lib/mactrade-catalog";
// Read eBay activation flags at request time, not from prerendered build output.
export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Produktsuche: Produkte und Preise vergleichen", description:"Suche nach Produkten und entdecke passende Händlerangebote, Preise und Einkaufsratgeber.", robots:{index:false,follow:true} };
export default function SearchPage() { return <main id="main" className="shell results-page"><Suspense fallback={<p role="status">Ratgeber werden geladen …</p>}><Results ebaySearch={ebaySearchEnabled()} samsungSearch={samsungCatalogEnabled()} joybuySearch={joybuyCatalogEnabled()} mactradeSearch={mactradeCatalogEnabled()} /></Suspense></main>; }
