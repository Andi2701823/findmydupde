import {macbookComputerIntent,relevantTitle} from "./unified-offers.ts";

type OfferTitle={product_name:string;price_cents:number};
type Page<T>={products:T[];total:number;page:number};

/**
 * Price-sorted supplier feeds commonly return 24 inexpensive accessories before
 * any actual MacBook. For computer intent, scan a bounded number of next pages
 * server-side, filtering FIRST and returning at most 24 genuine laptops.
 * The original total counts *unfiltered* matches, so do not claim a full count.
 */
export async function relevantMacbookPage<T extends OfferTitle>(
 query:string,
 getPage:(page:number)=>Promise<Page<T>>,
 pageSize=24,maxPages=5
):Promise<{products:T[];total:number}>{
 const first=await getPage(1);
 if(!macbookComputerIntent(query))return {products:first.products,total:first.total};
 const results:T[]=first.products.filter(p=>relevantTitle(p.product_name,query));
 const seen=new Set(results.map(p=>p.product_name+"|"+p.price_cents));
 for(let page=2;page<=maxPages&&results.length<pageSize&&(page-1)*pageSize<first.total;page++){
  const next=await getPage(page);
  for(const p of next.products){
   if(!relevantTitle(p.product_name,query))continue;
   const k=p.product_name+"|"+p.price_cents;
   if(seen.has(k))continue;
   results.push(p);
   seen.add(k);
   if(results.length>=pageSize)break;
  }
  if(next.products.length<pageSize)break;
 }
 return {products:results.slice(0,pageSize),total:results.length};
}
