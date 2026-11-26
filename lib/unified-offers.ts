import {matchesProductIntent} from "./product-classification.ts";
import type {AnthbotProduct} from "./anthbot-products";
export type OfferSource="beauty"|"joybuy"|"samsung"|"mactrade"|"ebay"|"anthbot"|"imou";
export type SearchOffer={
  id:string;source:OfferSource;merchant:string;title:string;image:string;href:string;
  articleCents:number;shippingCents:number|null;condition:string|null;
  priceUpdated:string|null;category?:string;
};
type Entry=Record<string,unknown>;
export type BeautyEntry={id:string;name:string;image:string;priceCents:number;affiliateUrl:string;merchant:string};
const merchantNames:Record<OfferSource,string>={
  beauty:"bdr-beauty",joybuy:"JoyBuy",samsung:"Samsung Shop",mactrade:"MacTrade",ebay:"eBay",anthbot:"ANTHBOT",imou:"IMOU DE"
};
function urlAt(raw:unknown,host:string,path:string):raw is string{
  if(typeof raw!=="string")return false;
  try{const u=new URL(raw);return u.protocol==="https:"&&u.hostname===host&&u.pathname===path&&!u.username&&!u.password&&!u.port;}
  catch{return false;}
}
function imageAt(raw:unknown,source:OfferSource):raw is string{
  if(typeof raw!=="string")return false;
  try{
    const u=new URL(raw);
    if(u.protocol!=="https:"||u.username||u.password||u.port)return false;
    if(source==="ebay")return u.hostname==="i.ebayimg.com";
    if(source==="imou")return u.hostname==="cdn.shopify.com"&&u.pathname.startsWith("/s/files/1/0727/5711/7240/");
    if(source==="anthbot")return u.hostname==="cdn.shopify.com"&&u.pathname.startsWith("/s/files/1/0904/5983/2633/");
    if(source==="mactrade")return u.hostname==="www.mactrade.de"&&u.pathname.startsWith("/media/");
    if(source==="samsung")return ["images.samsung.com","dashboard.feedspark.com"].includes(u.hostname);
    if(source==="joybuy")return u.hostname==="images1.joy-sourcing.com";
    return u.hostname==="bdr-beauty.com"&&u.pathname.startsWith("/wp-content/uploads/");
  }catch{return false;}
}
function affiliateAt(raw:unknown,source:OfferSource):raw is string {
  if(source==="ebay"){
    if(typeof raw!=="string")return false;
    try{const u=new URL(raw);return u.protocol==="https:"&&!u.username&&!u.password&&!u.port&&
      ["ebay.de","ebay.com"].some(h=>u.hostname===h||u.hostname.endsWith("."+h));}
    catch{return false;}
  }
  if(source==="anthbot"){
    if(!urlAt(raw,"www.awin1.com","/cread.php"))return false;
    const u=new URL(raw);
    if(u.searchParams.get("awinmid")!=="125144"||u.searchParams.get("awinaffid")!=="3123004")return false;
    try {const target=new URL(u.searchParams.get("ued")||"");return target.protocol==="https:"&&target.hostname==="de.anthbot.com"&&target.pathname.startsWith("/products/")&&!target.username&&!target.password;}catch{return false;}
  }
  const path=source==="joybuy"?"/cread.php":"/pclick.php";
  if(!urlAt(raw,"www.awin1.com",path))return false;
  const u=new URL(raw);
  if(source==="joybuy")return u.searchParams.get("awinmid")==="123926"&&u.searchParams.get("awinaffid")==="3123004";
  return u.searchParams.get("m")===({beauty:"125128",samsung:"14815",mactrade:"13737",imou:"125816"} as const)[source]
    &&u.searchParams.get("a")==="3123004";
}
function cents(raw:unknown,positive=true):number|null{
  return typeof raw==="number"&&Number.isSafeInteger(raw)&&raw>=0&&raw<100_000_000&&(!positive||raw>0)?raw:null;
}
function words(value:string):string[]{
  return value.normalize("NFKD").replace(/\p{M}/gu,"").toLocaleLowerCase("de")
    .split(/[^\p{L}\p{N}]+/u).filter(Boolean);
}
const deviceTokens=new Set(["iphone","ipad","macbook","imac","galaxy","pixel"]);
const accessories=new Set(["case","cover","huelle","hulle","schutzhulle","panzerglas","schutzglas","schutzfolie",
 "schutz","folie","charger","ladegeraet","ladekabel","kabel","adapter","holder","halterung",
 "displayfolie","bildschirmfolie","bumper","shell","etui","ladehulle","tasche","laptoptasche",
 "sleeve","bag","sleeves","dock","dockingstation","hub","usb","netzteil","netzadapter","staender",
 "stand","skin","sticker","zubehoer","accessory","zubehor","powerbank","schutzhuelle"]);
const variants=new Set(["pro","max","plus","ultra","air","mini","fe"]);
const macbookFamilies=["air","pro","neo"] as const;

export function macbookComputerIntent(query:string):boolean{
 const parts=words(query);
 return parts.includes("macbook")&&!parts.some(p=>accessories.has(p)||p.startsWith("tasche"));
}
function macbookComputerTitle(title:string):boolean {
 // A real MacBook listing can say "Kein Netzteil" / "ohne Netzteil".
 // Those packaging disclaimers must not be mistaken for a charger offer.
 const safe=title.replace(/\b(?:kein|ohne)\s+netzteil\b/gi,"");
 const parts=words(safe);
 if(!parts.includes("macbook"))return false;
 if(parts.some(p=>accessories.has(p)||p.startsWith("tasche")||p==="larobe"))return false;
 // Reject accessories presented as MacBook-compatible without naming a computer.
 if(/\b(?:fuer|für|for|compatible|kompatibel|passend)\b[\s\S]{0,60}\bmacbook\b/i.test(safe))return false;
 // An Apple notebook should be identifiable as the actual device or by its specs.
 const normalized=safe.normalize("NFKD").replace(/\p{M}/gu,"").toLocaleLowerCase("de-DE");
 const deviceWords=/(?:^|\s|\/\/\s*)(?:apple\s+)?macbook\b|\bapple\s+(?:\d{2}\s+zoll\s+)?macbook\b/;
 const hardware=/\b(?:ssd|ram|cpu|gpu|chip|laptop|notebook|touch\s*id|a18|m[1-9])\b|\b(?:\d{1,2}\s*gb|\d{1,2}gb)\b/;
 return deviceWords.test(normalized)||hardware.test(normalized);
}
function macbookFamily(title:string):string|null{
 const match=title.normalize("NFKD").replace(/\p{M}/gu,"").toLocaleLowerCase("de-DE")
  .match(/\bmacbook\s+(air|pro|neo)\b/);
 return match?match[1]:null;
}
// Match audio product nouns, not mere compatibility mentions in accessory titles.
const headphoneNoun=/^(?:kopfhorer(?:n)?|headphones?|headsets?|ohrhorer(?:n)?|earbuds?|earphones?)$/;
const audioAccessory=/^(?:audio(?:kabel|adapter)|auxkabel|klinken(?:kabel|stecker|adapter)|ladekabel|ladegerat(?:e)?|ladegerate|ladestation|ladecase|ladeetui|netzteil|netzadapter|adapter|kabel|ersatzkabel|verlangerungskabel|ohrpolster|ersatzpolster|ohrmuscheln|ohrstopsel|ersatzteile|reparaturset|halterung|kopfhorerstander|stander|aufbewahrungstasche|tasche|etui|case|cover|schutzhulle|zubehor)$/;
export function headphoneIntent(query:string):boolean{
 const p=words(query);
 return p.some(w=>headphoneNoun.test(w))&&!p.some(w=>audioAccessory.test(w));
}
function headphoneTitle(title:string):boolean{
 const p=words(title);
 const noun=p.findIndex(w=>headphoneNoun.test(w));
 if(noun<0)return false;
 // "Kabel für Kopfhörer", "Ladegerät ... ideal für Bluetooth-Kopfhörer".
 const before=p.slice(0,noun);
 if(before.some(w=>audioAccessory.test(w)))return false;
 if(before.some(w=>["fur","fuer","for","kompatibel","compatible","passend"].includes(w)))return false;
 // Avoid treating "Kopfhörer Kabelgebunden" or "Kopfhörer mit Kabel" as accessories.
 const after=p.slice(noun+1);
 if(after.length&&audioAccessory.test(after[0]))return false;
 if(after.some(w=>/^(?:ersatzkabel|ohrpolster|ersatzpolster|ladecase|ladeetui|kopfhorerstander|schutzhulle|reparaturset)$/.test(w)))return false;
 return true;
}
export function relevantTitle(title:string,query:string,category?:string):boolean{
 if(!matchesProductIntent(title,query,category))return false;
 const parts=words(query);
 const titleParts=words(title);
 if(parts.length===0||!parts.every(p=>titleParts.some(w=>w===p||w.startsWith(p))))return false;
 if(headphoneIntent(query)&&!headphoneTitle(title))return false;
 if(macbookComputerIntent(query)){
   if(!macbookComputerTitle(title))return false;
   const requested=macbookFamilies.find(f=>parts.includes(f));
   if(requested){
     const found=macbookFamily(title);
     if(found&&found!==requested)return false;
   }
   return true;
 }
 // Searching explicitly for MacBook accessories should retain Air/Pro-related
 // compatible items, instead of incorrectly applying computer model rules.
 if(parts.includes("macbook"))return true;
 const deviceSearch=parts.some(t=>deviceTokens.has(t));
 if(deviceSearch&&!parts.some(t=>accessories.has(t))&&titleParts.some(t=>accessories.has(t)))return false;
 if(deviceSearch){
   // Do not mix iPhone 16 with Pro/Max/Plus, or Pro with Pro Max.
   for(const variant of variants){
     if(titleParts.includes(variant)&&!parts.includes(variant))return false;
   }
 }
 return true;
}
export function beautyOffers(products:BeautyEntry[]):SearchOffer[]{
  return products.flatMap(p=>cents(p.priceCents)!==null&&imageAt(p.image,"beauty")&&affiliateAt(p.affiliateUrl,"beauty")
    ?[{id:"beauty:"+p.id,source:"beauty" as const,merchant:merchantNames.beauty,title:p.name,image:p.image,
       href:p.affiliateUrl,articleCents:p.priceCents,shippingCents:null,condition:null,priceUpdated:"2026-06-25"}]
    :[]);
}
export function anthbotOffers(products:readonly AnthbotProduct[]):SearchOffer[]{
  return products.flatMap(p=>cents(p.priceCents)!==null&&imageAt(p.image,"anthbot")&&affiliateAt(p.affiliateUrl,"anthbot")
    ?[{id:"anthbot:"+p.id,source:"anthbot" as const,merchant:merchantNames.anthbot,title:p.name,image:p.image,
       href:p.affiliateUrl,articleCents:p.priceCents,shippingCents:null,condition:/generalüberholt/i.test(p.name)?"Generalüberholt":null,priceUpdated:"2026-10-16",category:p.category}]
    :[]);
}
export function feedOffers(source:"joybuy"|"samsung"|"mactrade"|"imou",raw:unknown):SearchOffer[]{
  if(!raw||typeof raw!=="object"||!Array.isArray((raw as {products?:unknown}).products))throw Error("Invalid feed data");
  const arr=(raw as {products:unknown[]}).products;
  if(arr.length>24)throw Error("Feed over limit");
  return arr.flatMap(product=>{
    if(!product||typeof product!=="object"||Array.isArray(product))return [];
    const p=product as Entry;
    const id=source==="joybuy"?p.external_id:p.aw_product_id;
    const price=cents(p.price_cents);
    if(typeof id!=="string"||!/^\d{1,24}$/.test(id)||typeof p.product_name!=="string"||
       !p.product_name||price===null||!imageAt(p.image_url,source)||!affiliateAt(p.affiliate_url,source))return [];
    const shipping=cents(source==="joybuy"?p.shipping_cents:p.delivery_cents,false);
    return [{id:source+":"+id,source,merchant:merchantNames[source],title:p.product_name,image:p.image_url,
      href:p.affiliate_url,articleCents:price,shippingCents:shipping,condition:null,priceUpdated:source==="imou"?"2026-10-16":null,category:typeof p.category==="string"?p.category:undefined}];
  });
}
export function ebayOffers(raw:unknown):SearchOffer[]{
  if(!raw||typeof raw!=="object"||(raw as Entry).source!=="ebay"||!Array.isArray((raw as Entry).items))throw Error("Invalid eBay response");
  const items=(raw as {items:unknown[]}).items;
  if(items.length>20)throw Error("eBay over limit");
  return items.flatMap(product=>{
    if(!product||typeof product!=="object"||Array.isArray(product))return [];
    const p=product as Entry;
    if(typeof p.externalId!=="string"||typeof p.title!=="string"||!p.title||
       p.currency!=="EUR"||p.retailer!=="eBay"||
       typeof p.price!=="number"||!Number.isFinite(p.price)||p.price<=0||p.price>=1_000_000||
       !imageAt(p.imageUrl,"ebay")||!affiliateAt(p.outboundUrl,"ebay"))return [];
    const shipment=p.shippingCost&&typeof p.shippingCost==="object"?p.shippingCost as Entry:null;
    const rawShipping=shipment?.value;
    const val=shipment?.currency==="EUR"&&(typeof rawShipping==="number"||(typeof rawShipping==="string"&&rawShipping.trim()!==""))?Number(rawShipping):NaN;
    const shipping=Number.isFinite(val)&&val>=0&&val<1_000_000?Math.round(val*100):null;
    return [{id:"ebay:"+p.externalId,source:"ebay" as const,merchant:merchantNames.ebay,title:p.title,
      image:p.imageUrl,href:p.outboundUrl,articleCents:Math.round(p.price*100),shippingCents:shipping,
      condition:typeof p.condition==="string"?p.condition:null,
      priceUpdated:typeof p.priceObservedAt==="string"?p.priceObservedAt:null}];
  });
}
export type OfferSort="relevance"|"article"|"total";
export function knownTotal(offer:SearchOffer):number|null{
 return offer.shippingCents===null?null:offer.articleCents+offer.shippingCents;
}
export function sortOffers(offers:readonly SearchOffer[],sort:OfferSort,query=""):SearchOffer[]{
 const q=words(query).join(" ");
 const score=(title:string)=>{const t=words(title).join(" ");return q&&t===q?3:q&&t.startsWith(q+" ")?2:q&&t.includes(q)?1:0;};
 return [...offers].sort((a,b)=>{
  if(sort==="relevance"){const difference=score(b.title)-score(a.title);if(difference)return difference;}
  if(sort==="total"){
   const at=knownTotal(a),bt=knownTotal(b);
   if(at===null&&bt!==null)return 1;
   if(at!==null&&bt===null)return -1;
   if(at!==null&&bt!==null&&at!==bt)return at-bt;
  }
  return a.articleCents-b.articleCents||a.title.localeCompare(b.title,"de")||a.merchant.localeCompare(b.merchant);
 });
}
export function rankedOffers(offers:SearchOffer[],query:string):SearchOffer[]{
  const seen=new Set<string>();
  return sortOffers(offers.filter(p=>{
    if(seen.has(p.id)||!relevantTitle(p.title,query,p.category))return false;
    seen.add(p.id);return true;
  }),"article");
}
