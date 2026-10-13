export type Category = "Mode" | "Beauty" | "Wohnen" | "Technik";
export interface Product {
  id: string;
  title: string;
  category: Category;
  description: string;
  color: string;
  material: string;
  tags: string[];
  image: string;
  // Fictional design fixtures only. Never use these as retailer prices.
  demoPrice: number;
  demoReferencePrice: number;
  source: "demo";
}
export interface SearchIntent {
  query: string;
  category?: Category;
  mode: "text" | "image-demo";
}
export interface SearchFilters {
  category: Category | "Alle";
  maxPrice: number;
  color: string;
  sort: "relevance" | "price-asc" | "price-desc";
}
export interface CatalogProvider {
  search(
    intent: SearchIntent,
  ): Promise<{ products: Product[]; source: "demo"; notice: string }>;
}
// Integration boundary for a future SERVER implementation. No credentials in the client.
export interface ImageRecognizer {
  recognize(
    image: Blob,
  ): Promise<{ category?: Category; attributes: string[] }>;
}
export interface VerifiedOffer {
  source: "awin";
  externalId: string;
  title: string;
  imageUrl: string;
  price: number;
  currency: "EUR";
  retailer: string;
  outboundUrl: string;
  priceObservedAt: string;
  availability?: string;
}
