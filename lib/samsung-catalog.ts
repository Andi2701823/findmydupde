import "server-only";
import {resolveSupabaseCatalogConfig} from "./supabase-public-config";
import {samsungOrdering,samsungSort,type SamsungSort} from "./samsung-filters";

export const samsungCategories = ["Smartphones","Tablets","Smartwatches","Fernseher","Monitore","Audio","Speicher & SSD","Haushaltsgeräte","Zubehör","Sonstiges"] as const;
export type SamsungCategory = (typeof samsungCategories)[number];
export type SamsungProduct = {
  aw_product_id:string; product_name:string; description:string; category:SamsungCategory;
  price_cents:number; delivery_cents:number|null; image_url:string; affiliate_url:string; merchant_name:string;
};
type Lookup = {q?:string; category?:string; page?:number; pageSize?:number; minCents?:number|null; maxCents?:number|null; sort?:SamsungSort};
function apiConfig(){return resolveSupabaseCatalogConfig(process.env);}
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
export async function searchSamsungProducts({q="",category="",page=1,pageSize=24,minCents=null,maxCents=null,sort="name"}:Lookup={}):Promise<{products:SamsungProduct[];total:number;page:number}> {
  const config=apiConfig();
  if(!config)throw new Error("Samsung catalog is not configured");
  const safePage=Number.isSafeInteger(page)?Math.max(1,Math.min(100,page)):1;
  const safeLimit=Number.isSafeInteger(pageSize)?Math.max(1,Math.min(24,pageSize)):24;
  const endpoint=new URL(config.url+"/rest/v1/samsung_feed_products");
  endpoint.searchParams.set("select","aw_product_id,product_name,description,category,price_cents,delivery_cents,image_url,affiliate_url,merchant_name");
  endpoint.searchParams.set("published","eq.true");
  endpoint.searchParams.set("order",samsungOrdering(samsungSort(sort)));
  endpoint.searchParams.set("limit",String(safeLimit));
  endpoint.searchParams.set("offset",String((safePage-1)*safeLimit));
  const term=sanitizeSamsungQuery(q);
  if(term)endpoint.searchParams.set("product_name","ilike.*"+term.replace(/\s+/g,"*")+"*");
  if(validSamsungCategory(category))endpoint.searchParams.set("category","eq."+category);
  if(minCents!==null&&Number.isSafeInteger(minCents)&&minCents>=0)endpoint.searchParams.append("price_cents","gte."+minCents);
  if(maxCents!==null&&Number.isSafeInteger(maxCents)&&maxCents>=0)endpoint.searchParams.append("price_cents","lte."+maxCents);
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
