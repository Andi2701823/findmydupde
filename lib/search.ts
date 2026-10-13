import { products } from "./catalog.ts";
import type {
  CatalogProvider,
  Product,
  SearchFilters,
  SearchIntent,
} from "./types.ts";
export const normalize = (text: string) =>
  text
    .toLocaleLowerCase("de")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ß/g, "ss")
    .trim();
export function searchDemo(intent: SearchIntent): Product[] {
  if (intent.mode === "image-demo")
    return products.filter((p) => p.category === intent.category);
  const tokens = normalize(intent.query).split(/\s+/).filter(Boolean);
  if (!tokens.length) return [...products];
  return products
    .map((product) => {
      const haystack = normalize(
        [
          product.title,
          product.category,
          product.color,
          product.material,
          ...product.tags,
        ].join(" "),
      );
      return {
        product,
        score: tokens.reduce(
          (sum, token) => sum + Number(haystack.includes(token)),
          0,
        ),
      };
    })
    .filter((item) => item.score === tokens.length)
    .sort((a, b) => b.score - a.score)
    .map((item) => item.product);
}
export function filterProducts(
  items: Product[],
  filters: SearchFilters,
): Product[] {
  const result = items.filter(
    (p) =>
      (filters.category === "Alle" || p.category === filters.category) &&
      p.demoPrice <= filters.maxPrice &&
      (filters.color === "Alle" || p.color === filters.color),
  );
  if (filters.sort === "price-asc")
    result.sort((a, b) => a.demoPrice - b.demoPrice);
  if (filters.sort === "price-desc")
    result.sort((a, b) => b.demoPrice - a.demoPrice);
  return result;
}
export const demoCatalog: CatalogProvider = {
  async search(intent) {
    return {
      products: searchDemo(intent),
      source: "demo",
      notice:
        "Nur erfundene Demoprodukte und Beispielpreise. Keine Live-Suche oder Shop-Angebote.",
    };
  },
};
export const euro = (value: number) =>
  new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
