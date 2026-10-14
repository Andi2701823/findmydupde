"use client";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { categories } from "@/lib/catalog";
import { demoCatalog, filterProducts, euro } from "@/lib/search";
import type {
  Category,
  Product,
  SearchFilters,
  SearchIntent,
} from "@/lib/types";
import { SearchBox } from "./search-box";
import { LiveResults } from "./live-results";
import { EbayResults } from "./ebay-results";
import { ProductCard } from "./product-card";
import { Icon } from "./icon";
const defaults: SearchFilters = {
  category: "Alle",
  maxPrice: 200,
  color: "Alle",
  sort: "relevance",
};
export function Results({ liveCatalog = false, ebaySearch = false }: { liveCatalog?: boolean; ebaySearch?: boolean }) {
  const params = useSearchParams();
  const query = (params.get("q") || "").slice(0, 120);
  const imageDemo = params.get("mode") === "image-demo";
  const categoryParam = params.get("category");
  const category = categories.find((c) => c === categoryParam);
  if (liveCatalog && !imageDemo) return <LiveResults key={query} query={query} />;
  if (ebaySearch && !imageDemo) return <EbayResults key={query} query={query} />;
  return (
    <ResultsView
      key={`${query}:${category || ""}:${imageDemo}`}
      query={query}
      imageDemo={imageDemo}
      category={category}
    />
  );
}
function ResultsView({
  query,
  imageDemo,
  category,
}: {
  query: string;
  imageDemo: boolean;
  category?: Category;
}) {
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>(() => ({
    ...defaults,
    category: imageDemo ? "Alle" : category || "Alle",
  }));
  const [filtersOpen, setFiltersOpen] = useState(false);
  useEffect(() => {
    let cancelled = false;
    const intent: SearchIntent = {
      query,
      category: category || "Mode",
      mode: imageDemo ? "image-demo" : "text",
    };
    demoCatalog
      .search(intent)
      .then((result) => {
        if (!cancelled) {
          setItems(result.products);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setFailed(true);
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [query, category, imageDemo]);
  const visible = useMemo(
    () => filterProducts(items, filters),
    [items, filters],
  );
  const activeCount =
    Number(filters.category !== "Alle") +
    Number(filters.color !== "Alle") +
    Number(filters.maxPrice !== 200);
  return (
    <>
      <div className="breadcrumb">
        <Link href="/">Startseite</Link>
        <span>/</span> Entdecken
      </div>
      <div className="results-heading">
        <span className="eyebrow">DEIN NÄCHSTER LIEBLINGSFUND</span>
        <h1>
          {imageDemo
            ? "Deine Bildsuche, als Demo."
            : query
              ? `Funde für „${query}“`
              : "Lass dich inspirieren."}
        </h1>
        <p>
          {imageDemo
            ? `Beispielprodukte aus ${category || "Mode"}. Dein Foto wurde nicht analysiert oder hochgeladen.`
            : "Entdecke unseren fiktiven Beispielkatalog und probiere die Suche aus."}
        </p>
      </div>
      <SearchBox compact initialQuery={query} />
      <div className="demo-banner">
        <Icon name="sparkle" />
        <div>
          <strong>Du bist im Demo-Katalog.</strong>
          <p>
            Erfundene Produkte, Illustrationen und Beispielpreise. Keine echten
            Händlerangebote oder geprüften Preisvorteile.
          </p>
        </div>
        <span className="demo-pill">DEMO</span>
      </div>
      <div className="results-toolbar">
        <span role="status" aria-live="polite">
          {loading
            ? "Wird geladen …"
            : `${visible.length} Demo${visible.length === 1 ? "produkt" : "produkte"}`}
        </span>
        <div>
          <button
            className="button secondary filter-toggle"
            aria-expanded={filtersOpen}
            aria-controls="filters"
            onClick={() => setFiltersOpen(!filtersOpen)}
          >
            <Icon name="filter" /> Filter{" "}
            {activeCount > 0 && `(${activeCount})`}
          </button>
          <label htmlFor="sort" className="sr-only">
            Sortieren
          </label>
          <select
            id="sort"
            value={filters.sort}
            onChange={(e) =>
              setFilters({
                ...filters,
                sort: e.target.value as SearchFilters["sort"],
              })
            }
          >
            <option value="relevance">Standard</option>
            <option value="price-asc">Beispielpreis aufsteigend</option>
            <option value="price-desc">Beispielpreis absteigend</option>
          </select>
        </div>
      </div>
      <div className="results-layout">
        <aside
          id="filters"
          className={`filters ${filtersOpen ? "filters-open" : ""}`}
          aria-label="Produktfilter"
        >
          <div className="filter-heading">
            <h2>
              <Icon name="filter" /> Filter
            </h2>
            <button className="text-link" onClick={() => setFilters(defaults)}>
              Zurücksetzen
            </button>
          </div>
          <fieldset>
            <legend>Kategorie</legend>
            {["Alle", ...categories].map((c) => (
              <label className="radio-label" key={c}>
                <input
                  type="radio"
                  name="category"
                  value={c}
                  checked={filters.category === c}
                  onChange={() =>
                    setFilters({ ...filters, category: c as Category | "Alle" })
                  }
                />
                {c === "Alle" ? "Alle Kategorien" : c}
              </label>
            ))}
          </fieldset>
          <div className="filter-block">
            <label htmlFor="max-price">
              Max. Beispielpreis <strong>{euro(filters.maxPrice)}</strong>
            </label>
            <input
              type="range"
              id="max-price"
              min="0"
              max="200"
              step="1"
              value={filters.maxPrice}
              onChange={(e) =>
                setFilters({ ...filters, maxPrice: Number(e.target.value) })
              }
            />
            <div className="range-labels">
              <span>0 €</span>
              <span>200 €</span>
            </div>
          </div>
          <div className="filter-block">
            <label htmlFor="color">Farbe</label>
            <select
              id="color"
              value={filters.color}
              onChange={(e) =>
                setFilters({ ...filters, color: e.target.value })
              }
            >
              {["Alle", "Grün", "Creme", "Braun", "Schwarz", "Rosa"].map(
                (c) => (
                  <option key={c}>{c}</option>
                ),
              )}
            </select>
          </div>
          <p className="filter-hint">
            Die Preisfilter beziehen sich ausschließlich auf erfundene
            Beispielpreise.
          </p>
        </aside>
        <section aria-label="Suchergebnisse">
          {loading ? (
            <p role="status">Beispiele werden geladen …</p>
          ) : failed ? (
            <div className="empty-state">
              <Icon name="search" />
              <h2>Der Katalog konnte nicht geladen werden.</h2>
              <p>Bitte lade die Seite erneut.</p>
            </div>
          ) : visible.length ? (
            <div className="product-grid results-grid">
              {visible.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <Icon name="search" />
              <h2>Hier ist noch kein passender Fund.</h2>
              <p>
                {items.length
                  ? "Versuche einen höheren Beispielpreis oder andere Filter."
                  : "Unser Demo-Katalog ist klein. Probiere „Tasche“, „Sneaker“ oder „Lampe“."}
              </p>
              <button
                className="button secondary"
                onClick={() => setFilters(defaults)}
              >
                Filter zurücksetzen
              </button>
              <Link href="/suche/" className="text-link">
                Gesamten Demo-Katalog ansehen <Icon name="arrow" />
              </Link>
            </div>
          )}
        </section>
      </div>
    </>
  );
}
