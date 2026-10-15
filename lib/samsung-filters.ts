/** Pure search parameter validation for the server-side Samsung catalog. */
export const samsungSorts=["name","price-asc","price-desc"] as const;
export type SamsungSort=(typeof samsungSorts)[number];
export function samsungSort(value:string|undefined):SamsungSort {
  return (samsungSorts as readonly string[]).includes(value||"")?value as SamsungSort:"name";
}
export function parseEuroCents(value:string|undefined):number|null {
  if(!value)return null;
  const trimmed=value.trim();
  if(!/^\d{1,5}(?:[.,]\d{1,2})?$/.test(trimmed))return null;
  const [whole,decimal=""]=trimmed.replace(",",".").split(".");
  const cents=Number(whole)*100+Number(decimal.padEnd(2,"0"));
  return Number.isSafeInteger(cents)&&cents>=0&&cents<=20_000_00?cents:null;
}
export function validPriceRange(min:number|null,max:number|null):boolean {
  return min===null||max===null||min<=max;
}
export function samsungOrdering(sort:SamsungSort):string {
  return sort==="price-asc"?"price_cents.asc,aw_product_id.asc":sort==="price-desc"?"price_cents.desc,aw_product_id.asc":"product_name.asc,aw_product_id.asc";
}
