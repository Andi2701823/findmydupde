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
