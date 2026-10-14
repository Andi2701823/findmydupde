import { Suspense } from "react";
import type { Metadata } from "next";
import { Results } from "@/components/results";
export const metadata: Metadata = { title: "Einkaufsratgeber suchen", description:"Finde nützliche Einkaufsratgeber für Mode, Beauty, Wohnen und Technik." };
export default function SearchPage() { return <main id="main" className="shell results-page"><Suspense fallback={<p role="status">Ratgeber werden geladen …</p>}><Results /></Suspense></main>; }
