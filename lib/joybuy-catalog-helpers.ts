export const joybuyCategories=["Beauty & Pflege","Lebensmittel","Wohnen & Garten","Technik","Mode & Accessoires","Spielzeug","Haustiere","Möbel","Sport & Outdoor","Baby & Kind","Auto & Zubehör","Büro & Schule","Heimwerken","Freizeit","Foto & Optik","Gaming","Weitere Produkte"] as const;
export type JoybuyCategory=(typeof joybuyCategories)[number];
export type JoybuySort="name"|"price-asc"|"price-desc";
export function cleanJoybuySearch(value:string){return value.replace(/[^\p{L}\p{N}\s_-]/gu," ").replace(/\s+/g," ").trim().slice(0,80);}
export function validJoybuyCategory(value:string):value is JoybuyCategory{return (joybuyCategories as readonly string[]).includes(value);}
export function joybuySort(value:string):JoybuySort{return value==="price-asc"||value==="price-desc"?value:"name";}
export function euroCents(value:string|undefined):number|null{
  if(!value||!/^\d{1,5}(?:[.,]\d{1,2})?$/.test(value.trim()))return null;
  const [i,d=""]=value.trim().replace(",",".").split(".");
  const result=Number(i)*100+Number(d.padEnd(2,"0"));
  return Number.isSafeInteger(result)&&result>=0&&result<=2_000_000?result:null;
}
export function euro(value:number){return new Intl.NumberFormat("de-DE",{style:"currency",currency:"EUR"}).format(value/100);}
