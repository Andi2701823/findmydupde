import "server-only";
import { resolveSupabaseReadOnlyConfig } from "./supabase-public-config";

export const mactradeCategories = ["MacBooks","Desktop-Macs","iPhones","iPads","Apple Watch","Audio","Zubehör","Apple TV","Restposten","Sonstiges"] as const;
export type MactradeCategory = (typeof mactradeCategories)[number];
export type MactradeSort = "name" | "price-asc" | "price-desc";
export type MactradeProduct = {
  aw_product_id: string; product_name: string; category: MactradeCategory;
  price_cents: number; delivery_cents: number;
  image_url: string; affiliate_url: string; merchant_name: "MacTrade";
};
type Filters = {q?:string;category?:string;page?:number;pageSize?:number;minCents?:number|null;maxCents?:number|null;sort?:MactradeSort};

export function cleanMactradeSearch(value:string):string {
  return value.replace(/[^\p{L}\p{N}\s_-]/gu," ").replace(/\s+/g," ").trim().slice(0,80);
}
export function validMactradeCategory(value:string):value is MactradeCategory {
  return (mactradeCategories as readonly string[]).includes(value);
}
export function mactradeSort(value:string):MactradeSort {
  return value==="price-asc"||value==="price-desc"?value:"name";
}
export function mactradeEuros(cents:number):string {
  return new Intl.NumberFormat("de-DE",{style:"currency",currency:"EUR"}).format(cents/100);
}
export function parseMactradeEuros(input:string):number|null {
  if(!/^\d{1,6}(?:[,.]\d{1,2})?$/.test(input.trim()))return null;
  const [whole,decimal=""]=input.trim().replace(",",".").split(".");
  const result=Number(whole)*100+Number(decimal.padEnd(2,"0"));
  return Number.isSafeInteger(result)&&result<=100000000?result:null;
}
function config() {
  return resolveSupabaseReadOnlyConfig({
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY: process.env.SUPABASE_PUBLISHABLE_KEY,
    SAMSUNG_SUPABASE_URL: process.env.SAMSUNG_SUPABASE_URL,
    SAMSUNG_SUPABASE_PUBLISHABLE_KEY: process.env.SAMSUNG_SUPABASE_PUBLISHABLE_KEY
  });
}
export function mactradeCatalogEnabled():boolean {
  return process.env.MACTRADE_CATALOG_ENABLED==="true"&&config()!==null;
}
function safeUrl(raw:unknown,host:string,path:string):raw is string {
  if(typeof raw!=="string")return false;
  try {
    const url=new URL(raw);
    return url.protocol==="https:"&&url.hostname===host&&url.pathname.startsWith(path)&&
      !url.username&&!url.password&&!url.port;
  } catch { return false; }
}
function validProduct(raw:unknown):raw is MactradeProduct {
  if(!raw||typeof raw!=="object"||Array.isArray(raw))return false;
  const p=raw as Record<string,unknown>;
  if(typeof p.aw_product_id!=="string"||!/^\d{1,20}$/.test(p.aw_product_id)||
     typeof p.product_name!=="string"||!p.product_name||
     !validMactradeCategory(String(p.category))||
     !Number.isSafeInteger(p.price_cents)||Number(p.price_cents)<=0||
     !Number.isSafeInteger(p.delivery_cents)||Number(p.delivery_cents)<0||
     p.merchant_name!=="MacTrade"||
     !safeUrl(p.image_url,"www.mactrade.de","/media/")||
     !safeUrl(p.affiliate_url,"www.awin1.com","/pclick.php"))return false;
  const href=new URL(p.affiliate_url);
  return href.searchParams.get("m")==="13737"&&
    href.searchParams.get("a")==="3123004"&&
    href.searchParams.get("p")===p.aw_product_id;
}
export async function searchMactradeProducts({q="",category="",page=1,pageSize=24,minCents=null,maxCents=null,sort="name"}:Filters={}):Promise<{products:MactradeProduct[];total:number;page:number}> {
  const cfg=config();
  if(!mactradeCatalogEnabled()||!cfg)throw new Error("MacTrade catalog is disabled");
  const safePage=Number.isSafeInteger(page)?Math.max(1,Math.min(200,page)):1;
  const safeSize=Number.isSafeInteger(pageSize)?Math.max(1,Math.min(24,pageSize)):24;
  const u=new URL(cfg.url+"/rest/v1/mactrade_feed_products");
  u.searchParams.set("select","aw_product_id,product_name,category,price_cents,delivery_cents,image_url,affiliate_url,merchant_name");
  u.searchParams.set("published","eq.true");
  u.searchParams.set("in_stock","eq.true");
  u.searchParams.set("order",sort==="price-asc"?"price_cents.asc,aw_product_id.asc":sort==="price-desc"?"price_cents.desc,aw_product_id.asc":"product_name.asc,aw_product_id.asc");
  u.searchParams.set("limit",String(safeSize));
  u.searchParams.set("offset",String((safePage-1)*safeSize));
  const term=cleanMactradeSearch(q);
  if(term)u.searchParams.set("product_name","ilike.*"+term.replace(/\s+/g,"*")+"*");
  if(validMactradeCategory(category))u.searchParams.set("category","eq."+category);
  if(minCents!==null&&Number.isSafeInteger(minCents)&&minCents>=0)u.searchParams.append("price_cents","gte."+minCents);
  if(maxCents!==null&&Number.isSafeInteger(maxCents)&&maxCents>=0)u.searchParams.append("price_cents","lte."+maxCents);
  const response=await fetch(u.toString(),{headers:{apikey:cfg.key,Accept:"application/json",Prefer:"count=exact"},cache:"no-store",signal:AbortSignal.timeout(8000)});
  if(!response.ok)throw new Error("MacTrade search unavailable");
  const data:unknown=await response.json();
  if(!Array.isArray(data))throw new Error("Invalid MacTrade data");
  const products=data.filter(validProduct);
  const match=/\/(\d+)$/.exec(response.headers.get("content-range")||"");
  return {products,total:match?Number(match[1]):products.length,page:safePage};
}
