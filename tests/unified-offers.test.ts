import test from "node:test";
import {anthbotProducts} from "../lib/anthbot-products.ts";
import assert from "node:assert/strict";
import {rankedOffers,relevantTitle,beautyOffers,anthbotOffers,feedOffers,ebayOffers,type SearchOffer} from "../lib/unified-offers.ts";

function offer(id:string,title:string,articleCents:number):SearchOffer {
  return {id,source:"beauty",merchant:"bdr-beauty",title,articleCents,shippingCents:null,
    href:"https://www.awin1.com/pclick.php?p=45133289527&a=3123004&m=125128",
    image:"https://bdr-beauty.com/wp-content/uploads/demo.png",condition:null,priceUpdated:null};
}
test("unified results sort by article price across merchants, not by vendor",()=>{
 const results=rankedOffers([
   {...offer("samsung:11","Galaxy S26 256GB",89000),source:"samsung",merchant:"Samsung Shop"},
   {...offer("mactrade:12","Galaxy S26 256GB",74000),source:"mactrade",merchant:"MacTrade"},
   {...offer("beauty:13","Galaxy S26 256GB",72000),source:"beauty",merchant:"bdr-beauty"}
 ],"Galaxy S26");
 assert.deepEqual(results.map(x=>x.articleCents),[72000,74000,89000]);
 assert.deepEqual(results.map(x=>x.merchant),["bdr-beauty","MacTrade","Samsung Shop"]);
});
test("ignore unrelated products, duplicate identifiers, and mismatched multiword queries",()=>{
 const results=rankedOffers([
   offer("beauty:7","MacBook Pro 14 M5",190000),
   offer("beauty:7","MacBook Pro 14 M5",190000),
   offer("beauty:8","MacBook Air 15 M4",90000),
   offer("beauty:9","M5 case for notebooks",900)
 ],"MacBook Pro M5");
 assert.equal(results.length,1);
 assert.equal(results[0].id,"beauty:7");
 assert.equal(relevantTitle("iPhone 16 Pro Max","iphone 16 pro"),false);
 assert.equal(relevantTitle("iPhone 16 case","iphone 16 pro"),false);
 assert.equal(relevantTitle("Apple iPhone 16 Pro Max 256GB","iPhone 16 Pro"),false,"Different model variant must not appear as the same device");
 assert.equal(relevantTitle("Apple iPhone 16 Pro 256GB","iPhone 16 Pro"),true);
 assert.equal(relevantTitle("Apple iPhone 16 Pro 256GB","iPhone 16"),false);
 assert.equal(relevantTitle("iPhone 16 Schutzhülle silikon","iPhone 16"),false,"A 5-euro case is not a 5-euro phone");
 assert.equal(relevantTitle("iPhone 16 Schutzhülle silikon","iPhone 16 Schutzhülle"),true);
 assert.equal(relevantTitle("Samsung Galaxy S26 Ultra Cover","Galaxy S26 Ultra"),false);
});
test("feed validation rejects unexpected affiliate merchants and invalid prices",()=>{
 const base={aw_product_id:"44129500861",product_name:"MacBook Pro 16",price_cents:240000,delivery_cents:995,
   image_url:"https://www.mactrade.de/media/a.webp",
   affiliate_url:"https://www.awin1.com/pclick.php?p=44129500861&a=3123004&m=13737"};
 assert.equal(feedOffers("mactrade",{products:[base]}).length,1);
 assert.equal(feedOffers("mactrade",{products:[{...base,affiliate_url:"https://evil.example/a"}]}).length,0);
 assert.equal(feedOffers("mactrade",{products:[{...base,affiliate_url:"https://www.awin1.com/pclick.php?p=44129500861&a=3123004&m=14815"}]}).length,0);
 assert.equal(feedOffers("mactrade",{products:[{...base,price_cents:0}]}).length,0);
});
test("normalize eBay EUR items and known shipping, skip other currencies",()=>{
 const items=[{externalId:"aa",title:"iPhone 16 Pro",price:625.1,currency:"EUR",retailer:"eBay",
  imageUrl:"https://i.ebayimg.com/images/g/123/s-l500.jpg",outboundUrl:"https://www.ebay.de/itm/123",
  shippingCost:{value:"5.99",currency:"EUR"},condition:"Neu",priceObservedAt:"2026-10-15T13:00:00Z"},
 {...{externalId:"bb",title:"iPhone 16 Pro",price:625.1,currency:"USD",retailer:"eBay",
  imageUrl:"https://i.ebayimg.com/images/g/123/s-l500.jpg",outboundUrl:"https://www.ebay.com/itm/456"},shippingCost:null}];
 const result=ebayOffers({source:"ebay",items});
 assert.equal(result.length,1);
 assert.equal(result[0].articleCents,62510);
 assert.equal(result[0].shippingCents,599);
});
test("Beauty feed entries retain their original source without inventing shipping",()=>{
 const offers=beautyOffers([{id:"1352",name:"DermaLumin-C Serum",image:"https://bdr-beauty.com/wp-content/uploads/x.png",
  priceCents:3950,affiliateUrl:"https://www.awin1.com/pclick.php?p=45133289527&a=3123004&m=125128",merchant:"bdr-beauty DE"}]);
 assert.equal(offers[0].shippingCents,null);
 assert.equal(offers[0].articleCents,3950);
});

test("ANTHBOT Awin offers retain approved merchant links and participate in price ranking",()=>{
 const a=anthbotOffers(anthbotProducts);
 assert.equal(a.length,35);
 assert.equal(new Set(a.map(p=>p.id)).size,35);
 assert.ok(a.every(p=>p.source==="anthbot"&&p.merchant==="ANTHBOT"&&p.shippingCents===null));
 const original=a.find(p=>p.title.toLocaleLowerCase("de-DE").includes("genie"));
 assert.ok(original);
 const result=rankedOffers([original,{...original,id:"beauty:dummy",source:"beauty",merchant:"bdr-beauty",articleCents:original.articleCents+15000}], "genie");
 assert.deepEqual(result.map(p=>p.source),["anthbot","beauty"]);
 assert.equal(anthbotOffers([{...anthbotProducts[0],affiliateUrl:"https://evil.example/"}]).length,0);
});

test("IMOU is a validated Awin merchant source, rejecting lookalike shop and image links",()=>{
 const p={aw_product_id:"44993279802",product_name:"IMOU Ranger 2C WiFi Smart Kamera",price_cents:2799,
  image_url:"https://cdn.shopify.com/s/files/1/0727/5711/7240/products/imou-ranger.jpg",
  affiliate_url:"https://www.awin1.com/pclick.php?p=44993279802&a=3123004&m=125816"};
 const valid=feedOffers("imou",{products:[p]});
 assert.equal(valid.length,1);
 assert.equal(valid[0].source,"imou");
 assert.equal(valid[0].merchant,"IMOU DE");
 assert.equal(valid[0].articleCents,2799);
 assert.equal(feedOffers("imou",{products:[{...p,affiliate_url:p.affiliate_url.replace("m=125816","m=125128")}]}).length,0);
 assert.equal(feedOffers("imou",{products:[{...p,image_url:"https://evil.example/camera.png"}]}).length,0);
 assert.equal(feedOffers("imou",{products:[{...p,price_cents:0}]}).length,0);
});

test("MacBook computer searches keep actual Neo, Air and Pro models, not compatible accessories",()=>{
 const bad=[
  "RP // BEEZ LArobe MacBook 13,3'' - Pink",
  "Tomtoc 14 Zoll Laptop-Tasche mit Schutzhülle für MacBook Pro",
  "UGREEN USB-C Ladekabel 100W kompatibel mit MacBook",
  "Tech-Protect USB-C Adapter für MacBook",
  "Apple 96W USB-C Netzadapter – Ladegerät für MacBook Pro",
  "INNOCN 27 Zoll Monitor, perfekt für Apple MacBook",
  "MacBook Pro Sleeve Case",
 ];
 for(const title of bad)assert.equal(relevantTitle(title,"MacBook"),false,title);
 const real=[
  "Macbook Neo 13'' A18 6-Core CPU - 8 GB - 256 GB SSD - Kein Netzteil",
  "RP 2576 // Macbook Air 15'' - M4 10-Core CPU - 16 GB - 256 GB SSD",
  "Apple MacBook Pro 14'' M5 16 GB 512GB SSD",
  "Apple 13 Zoll MacBook Neo Laptop A18 Pro Chip 8 GB RAM 256 GB SSD",
 ];
 for(const title of real)assert.equal(relevantTitle(title,"MacBook"),true,title);
 assert.equal(relevantTitle(real[1],"MacBook Air"),true);
 assert.equal(relevantTitle(real[2],"MacBook Air"),false);
 assert.equal(relevantTitle(real[1],"MacBook Pro"),false);
 assert.equal(relevantTitle(real[2],"MacBook Pro"),true);
 assert.equal(relevantTitle("MacBook Air Tasche für MacBook Pro","MacBook Tasche"),true,"Explicit accessory queries should still find compatible cases");
 assert.equal(relevantTitle("RP // BEEZ LArobe MacBook Air 13'' Allure - Moka","MacBook"),false);
 const offers=[
  {...offer("mactrade:case","RP // BEEZ LArobe MacBook 13,3'' - Pink",1590),source:"mactrade" as const},
  {...offer("joybuy:adapter","USB-C Adapter für MacBook",395),source:"joybuy" as const},
  {...offer("mactrade:neo",real[0],71200),source:"mactrade" as const},
  {...offer("joybuy:pro",real[2],129900),source:"joybuy" as const}
 ];
 assert.deepEqual(rankedOffers(offers,"MacBook").map(o=>o.id),["mactrade:neo","joybuy:pro"]);
});
