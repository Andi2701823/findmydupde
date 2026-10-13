export class InvalidSearch extends Error {
  constructor() {
    super("Ungültige Suchparameter.");
    this.name = "InvalidSearch";
  }
}
export const MAX_AMOUNT_MINOR = 1_000_000_000;
export function amountMinor(raw: unknown): number {
  if (typeof raw !== "string" || !/^\d{1,8}(?:\.\d{1,2})?$/.test(raw))
    throw new InvalidSearch();
  const [whole, fraction = ""] = raw.split(".");
  const amount = Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
  if (!Number.isSafeInteger(amount) || amount > MAX_AMOUNT_MINOR)
    throw new InvalidSearch();
  return amount;
}
export interface CatalogSearch {
  q: string;
  tokens: string[];
  category?: string;
  color?: string;
  maxPriceMinor?: number;
  sort: "price-asc" | "price-desc" | "recent";
  page: number;
  pageSize: number;
}
export function parseSearch(params: URLSearchParams): CatalogSearch {
  const allowed = new Set([
    "q",
    "category",
    "color",
    "maxPrice",
    "sort",
    "page",
    "pageSize",
  ]);
  for (const key of params.keys())
    if (!allowed.has(key) || params.getAll(key).length !== 1)
      throw new InvalidSearch();
  const q = (params.get("q") || "").trim();
  if (q.length < 2 || q.length > 120 || /[\u0000-\u001f\u007f]/.test(q))
    throw new InvalidSearch();
  const tokens = q.split(/\s+/);
  if (tokens.length > 6) throw new InvalidSearch();
  const category = params.get("category") || undefined;
  if (category && !/^[a-z0-9-]{1,64}$/.test(category))
    throw new InvalidSearch();
  const color = params.get("color") || undefined;
  if (color && (color.length > 40 || /[\u0000-\u001f\u007f]/.test(color)))
    throw new InvalidSearch();
  const sort = params.get("sort") || "recent";
  if (!["price-asc", "price-desc", "recent"].includes(sort))
    throw new InvalidSearch();
  function bounded(name: string, fallback: number, maximum: number) {
    const value = params.get(name);
    if (value === null) return fallback;
    if (!/^[1-9]\d*$/.test(value)) throw new InvalidSearch();
    const n = Number(value);
    if (n > maximum) throw new InvalidSearch();
    return n;
  }
  return {
    q,
    tokens,
    category,
    color,
    ...(params.has("maxPrice")
      ? { maxPriceMinor: amountMinor(params.get("maxPrice")) }
      : {}),
    sort: sort as CatalogSearch["sort"],
    page: bounded("page", 1, 50),
    pageSize: bounded("pageSize", 12, 24),
  };
}
export const escapeLike = (token: string) =>
  token.replace(/[!%_]/g, (char) => "!" + char);
