import { Suspense } from "react";
import type { Metadata } from "next";
import { Results } from "@/components/results";
export const metadata: Metadata = { title: "Produktsuche: Händlerprodukte und Ratgeber finden", description:"Suche nach Produktnamen und entdecke echte Händlerangebote sowie Einkaufsratgeber für Mode, Beauty, Wohnen und Technik." };
export default function SearchPage() { return <main id="main" className="shell results-page"><Suspense fallback={<p role="status">Ratgeber werden geladen …</p>}><Results /></Suspense></main>; }
