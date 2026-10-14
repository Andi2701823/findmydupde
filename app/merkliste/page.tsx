import type { Metadata } from "next";
import { SavedProducts } from "@/components/saved-products";
export const metadata: Metadata = { title: "Gespeicherte Einkaufsratgeber", robots: {index:false,follow:true} };
export default function SavedPage() { return <main id="main" className="shell results-page"><SavedProducts /></main>; }
