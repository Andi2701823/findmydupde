"use client";
import Link from "next/link";
import { products } from "@/lib/catalog";
import { useFavorites } from "./favorites";
import { ProductCard } from "./product-card";
import { Icon } from "./icon";
export function SavedProducts() {
  const { ids } = useFavorites();
  const saved = products.filter((p) => ids.includes(p.id));
  return (
    <>
      <div className="results-heading">
        <span className="eyebrow">FÜR SPÄTER AUFHEBEN</span>
        <h1>Deine Lieblingsfunde.</h1>
        <p>
          Deine Merkliste wird nur in diesem Browser gespeichert. Alle Funde
          sind Demoprodukte.
        </p>
      </div>
      <p role="status" className="saved-count">
        {saved.length} {saved.length === 1 ? "Demoprodukt" : "Demoprodukte"}{" "}
        gemerkt
      </p>
      {saved.length ? (
        <div className="product-grid">
          {saved.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <Icon name="heart" />
          <h2>Platz für deine Favoriten.</h2>
          <p>
            Tippe auf das Herz bei einem Demoprodukt und finde es hier wieder.
          </p>
          <Link href="/suche/" className="button primary">
            Produkte entdecken <Icon name="arrow" />
          </Link>
        </div>
      )}
    </>
  );
}
