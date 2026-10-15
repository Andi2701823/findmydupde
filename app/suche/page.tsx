import { Suspense } from "react";
import type { Metadata } from "next";
import { Results } from "@/components/results";
import { ebaySearchEnabled } from "@/server/catalog/ebay-mode";
import { samsungCatalogEnabled } from "@/lib/samsung-catalog";
import { joybuyCatalogEnabled } from "@/lib/joybuy-catalog";
// Read eBay activation flags at request time, not from prerendered build output.
export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Produktsuche: Händlerprodukte und Ratgeber finden", description:"Suche nach Produktnamen und entdecke echte Händlerangebote sowie Einkaufsratgeber für Mode, Beauty, Wohnen und Technik." };
export default function SearchPage() { return <main id="main" className="shell results-page"><Suspense fallback={<p role="status">Ratgeber werden geladen …</p>}><Results ebaySearch={ebaySearchEnabled()} samsungSearch={samsungCatalogEnabled()} joybuySearch={joybuyCatalogEnabled()} /></Suspense></main>; }
