import { Suspense } from "react";
import type { Metadata } from "next";
import { Results } from "@/components/results";
import { stagingLiveCatalogEnabled, stagingEbaySearchEnabled } from "@/server/catalog/live-mode.ts";
export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Produkte entdecken" };
export default function SearchPage() {
  return (
    <main id="main" className="shell results-page">
      <Suspense fallback={<p role="status">Produktsuche wird geladen …</p>}>
        <Results liveCatalog={stagingLiveCatalogEnabled()} ebaySearch={stagingEbaySearchEnabled()} />
      </Suspense>
    </main>
  );
}
