import "server-only";
import {resolveSupabaseReadOnlyConfig} from "./supabase-public-config";
import {joybuyCategories,cleanJoybuySearch,validJoybuyCategory,joybuySort,euroCents,euro,type JoybuyCategory,type JoybuySort} from "./joybuy-catalog-helpers";
export {joybuyCategories,cleanJoybuySearch,validJoybuyCategory,joybuySort,euroCents,euro};

export type JoybuyProduct={
  external_id:string;product_name:string;description:string;category:JoybuyCategory;
  feed_category:string;brand:string;price_cents:number;original_price_cents:number;
  shipping_cents:number;image_url:string;affiliate_url:string;
};
type Options={q?:string;category?:string;brand?:string;minCents?:number|null;maxCents?:number|null;sort?:JoybuySort;page?:number;pageSize?:number};
export function joybuyCatalogEnabled(){return process.env.JOYBUY_CATALOG_ENABLED==="true"&&!!apiConfig();}
function apiConfig(){
  return resolveSupabaseReadOnlyConfig({
    SUPABASE_URL:process.env.SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY:process.env.SUPABASE_PUBLISHABLE_KEY,
    SAMSUNG_SUPABASE_URL:process.env.SAMSUNG_SUPABASE_URL,
    SAMSUNG_SUPABASE_PUBLISHABLE_KEY:process.env.SAMSUNG_SUPABASE_PUBLISHABLE_KEY,
  });
}
function trustedJoybuyProduct(p:unknown):p is JoybuyProduct{
  if(!p||typeof p!=="object")return false;
  const x=p as Record<string,unknown>;
  return typeof x.external_id==="string"&&/^\d{1,24}$/.test(x.external_id)&&
    typeof x.product_name==="string"&&x.product_name.length>0&&validJoybuyCategory(String(x.category))&&
    Number.isSafeInteger(x.price_cents)&&Number(x.price_cents)>0&&
    typeof x.image_url==="string"&&x.image_url.startsWith("https://images1.joy-sourcing.com/")&&
    typeof x.affiliate_url==="string"&&x.affiliate_url.startsWith("https://www.awin1.com/cread.php?")&&
    (()=>{try{const u=new URL(x.affiliate_url as string);return u.hostname==="www.awin1.com"&&u.searchParams.get("awinmid")==="123926"&&u.searchParams.get("awinaffid")==="3123004";}catch{return false;}})();
}
export async function searchJoybuyProducts({q="",category="",brand="",minCents=null,maxCents=null,sort="name",page=1,pageSize=24}:Options={}):Promise<{products:JoybuyProduct[],total:number,page:number}>{
  if(!joybuyCatalogEnabled())throw Error("Joybuy catalog disabled");
  const cfg=apiConfig();
  if(!cfg)throw Error("Missing Supabase publishable config");
  const safePage=Number.isSafeInteger(page)?Math.max(1,Math.min(100,page)):1;
  const safeSize=Number.isSafeInteger(pageSize)?Math.max(1,Math.min(24,pageSize)):24;
  const url=new URL(cfg.url+"/rest/v1/joybuy_feed_products");
  url.searchParams.set("select","external_id,product_name,description,category,feed_category,brand,price_cents,original_price_cents,shipping_cents,image_url,affiliate_url");
  url.searchParams.set("published","eq.true");
  url.searchParams.set("in_stock","eq.true");
  url.searchParams.set("order",sort==="price-asc"?"price_cents.asc,external_id.asc":sort==="price-desc"?"price_cents.desc,external_id.asc":"product_name.asc,external_id.asc");
  url.searchParams.set("limit",String(safeSize));
  url.searchParams.set("offset",String((safePage-1)*safeSize));
  const term=cleanJoybuySearch(q);
  if(term)url.searchParams.set("product_name","ilike.*"+term.replace(/\s+/g,"*")+"*");
  if(validJoybuyCategory(category))url.searchParams.set("category","eq."+category);
  const b=cleanJoybuySearch(brand);
  if(b)url.searchParams.set("brand","ilike.*"+b.replace(/\s+/g,"*")+"*");
  if(minCents!==null&&Number.isSafeInteger(minCents)&&minCents>=0)url.searchParams.append("price_cents","gte."+minCents);
  if(maxCents!==null&&Number.isSafeInteger(maxCents)&&maxCents>=0)url.searchParams.append("price_cents","lte."+maxCents);
  const response=await fetch(url.toString(),{headers:{apikey:cfg.key,Accept:"application/json",Prefer:"count=exact"},cache:"no-store",signal:AbortSignal.timeout(8000)});
  if(!response.ok)throw Error("Joybuy database query failed");
  const raw:unknown=await response.json();
  if(!Array.isArray(raw))throw Error("Invalid Joybuy response");
  const products=raw.filter(trustedJoybuyProduct);
  const match=/\/(\d+)$/.exec(response.headers.get("content-range")||"");
  return {products,total:match?Number(match[1]):products.length,page:safePage};
}
