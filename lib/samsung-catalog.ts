import "server-only";

export const samsungCategories = ["Smartphones","Tablets","Smartwatches","Fernseher","Monitore","Audio","Speicher & SSD","Haushaltsgeräte","Zubehör","Sonstiges"] as const;
export type SamsungCategory = (typeof samsungCategories)[number];
export type SamsungProduct = {
  aw_product_id:string; product_name:string; description:string; category:SamsungCategory;
  price_cents:number; delivery_cents:number|null; image_url:string; affiliate_url:string; merchant_name:string;
};
type Lookup = {q?:string; category?:string; page?:number; pageSize?:number};
function apiConfig() {
  if (process.env.SAMSUNG_CATALOG_ENABLED !== "true") return null;
  const url=(process.env.SAMSUNG_SUPABASE_URL || "").replace(/\/$/,"");
  const key=process.env.SAMSUNG_SUPABASE_PUBLISHABLE_KEY || "";
  // The website uses a read-only, RLS-governed public API key; never a service-role key.
  if (!/^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(url) || !key || key.length>512) return null;
  return {url,key};
}
export function samsungCatalogEnabled(){return apiConfig()!==null;}
export function sanitizeSamsungQuery(value:string):string {
  return value.replace(/[^\p{L}\p{N}\s_-]/gu," ").replace(/\s+/g," ").trim().slice(0,80);
}
export function validSamsungCategory(value:string):value is SamsungCategory {
  return (samsungCategories as readonly string[]).includes(value);
}
export function formatSamsungPrice(value:number):string {
  return new Intl.NumberFormat("de-DE",{style:"currency",currency:"EUR"}).format(value/100);
}
export async function searchSamsungProducts({q="",category="",page=1,pageSize=24}:Lookup={}):Promise<{products:SamsungProduct[];total:number;page:number}> {
  const config=apiConfig();
  if(!config)throw new Error("Samsung catalog is not configured");
  const safePage=Number.isSafeInteger(page)?Math.max(1,Math.min(100,page)):1;
  const safeLimit=Number.isSafeInteger(pageSize)?Math.max(1,Math.min(24,pageSize)):24;
  const endpoint=new URL(config.url+"/rest/v1/samsung_feed_products");
  endpoint.searchParams.set("select","aw_product_id,product_name,description,category,price_cents,delivery_cents,image_url,affiliate_url,merchant_name");
  endpoint.searchParams.set("published","eq.true");
  endpoint.searchParams.set("order","product_name.asc,aw_product_id.asc");
  endpoint.searchParams.set("limit",String(safeLimit));
  endpoint.searchParams.set("offset",String((safePage-1)*safeLimit));
  const term=sanitizeSamsungQuery(q);
  if(term)endpoint.searchParams.set("product_name","ilike.*"+term.replace(/\s+/g,"*")+"*");
  if(validSamsungCategory(category))endpoint.searchParams.set("category","eq."+category);
  const response=await fetch(endpoint.toString(),{
    headers:{apikey:config.key,Accept:"application/json",Prefer:"count=exact"},
    cache:"no-store",signal:AbortSignal.timeout(8000)
  });
  if(!response.ok)throw new Error("Samsung catalog temporarily unavailable");
  const raw:unknown=await response.json();
  if(!Array.isArray(raw))throw new Error("Invalid Samsung catalog response");
  const products=raw.filter((p):p is SamsungProduct => {
    if(!p||typeof p!=="object")return false;
    const x=p as Record<string,unknown>;
    return typeof x.aw_product_id==="string" && typeof x.product_name==="string" && validSamsungCategory(String(x.category)) &&
      typeof x.price_cents==="number" && typeof x.affiliate_url==="string" && x.affiliate_url.startsWith("https://www.awin1.com/pclick.php?") &&
      typeof x.image_url==="string" && /^https:\/\/(images\.samsung\.com|dashboard\.feedspark\.com)\//.test(x.image_url);
  });
  const match=/\/(\d+)$/.exec(response.headers.get("content-range")||"");
  return {products,total:match?Number(match[1]):products.length,page:safePage};
}
