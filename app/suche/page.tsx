import { Suspense } from "react";
import type { Metadata } from "next";
import { Results } from "@/components/results";
export const metadata: Metadata = { title: "Produkte entdecken" };
export default function SearchPage() {
  return (
    <main id="main" className="shell results-page">
      <Suspense fallback={<p role="status">Demo-Katalog wird geladen …</p>}>
        <Results />
      </Suspense>
    </main>
  );
}
