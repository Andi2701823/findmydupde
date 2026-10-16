import test from "node:test";
import assert from "node:assert/strict";
import {imouModels,imouVariantCount,imouCategories,findImouModels,findImouModelBySlug,imouModelPath,imouOfferRows,imouFeedDate} from "../lib/imou-products.ts";

test("IMOU feed is compact and contains exactly 69 distinct physical models and 559 stock-screened variants",()=>{
 assert.equal(imouModels.length,69);
 assert.equal(imouVariantCount,559);
 assert.equal(imouFeedDate,"16.10.2026");
 assert.equal(new Set(imouModels.map(m=>m.id)).size,69);
 assert.equal(new Set(imouModels.map(m=>m.slug)).size,69);
 for(const m of imouModels){
  assert.ok(imouCategories.includes(m.category));
  assert.match(m.slug,/^[a-z0-9-]+-\d{10,15}$/);
  assert.ok(m.description.length>20);
  assert.ok(m.variants.length>=1);
  assert.ok(m.name.length>3);
  assert.equal(m.minPriceCents,Math.min(...m.variants.map(v=>v.priceCents)));
  assert.equal(findImouModelBySlug(m.slug),m);
  assert.equal(imouModelPath(m),"/imou/"+m.slug+"/");
  for(const v of m.variants){
   assert.match(v.id,/^\d+$/);
   assert.ok(v.priceCents>0);
   assert.ok(v.name.length>0);
   assert.match(v.image,/^https:\/\/cdn\.shopify\.com\/s\/files\/1\/0727\/5711\/7240\//);
   assert.equal(v.affiliateUrl,"https://www.awin1.com/pclick.php?p="+v.id+"&a=3123004&m=125816");
   assert.ok(!/protect service-lizenz/i.test(v.name),"Excluded license does not appear in physical catalog");
  }
 }
});
test("IMOU model and offer searches are case-insensitive, filtered and bounded",()=>{
 assert.equal(findImouModels().length,69);
 assert.ok(findImouModels("ranger").length>=2);
 assert.ok(findImouModels("RANGER").length>=2);
 assert.ok(findImouModels("Ranger","Zubehör").every(m=>m.category==="Zubehör"));
 assert.equal(findImouModels("not-a-real-imou-model").length,0);
 const offers=imouOfferRows("Ranger");
 assert.ok(offers.length>0&&offers.length<=24);
 assert.ok(offers.every(v=>v.product_name.toLowerCase().includes("ranger")));
 assert.equal(new Set(offers.map(v=>v.aw_product_id)).size,offers.length);
 assert.ok(offers.every((v,i)=>i===0||offers[i-1].price_cents<=v.price_cents));
 assert.deepEqual(imouOfferRows(""),[]);
 assert.equal(imouOfferRows("Ranger",400).length,offers.length);
});
