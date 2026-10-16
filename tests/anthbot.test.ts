import test from "node:test";
import assert from "node:assert/strict";
import {anthbotProducts,findAnthbotProducts,formatAnthbotPrice,anthbotFeedSnapshot} from "../lib/anthbot-products.ts";
test("ANTHBOT contains 35 genuine physical and unique variants from one approved Awin feed",()=>{
 assert.equal(anthbotProducts.length,35);
 assert.equal(new Set(anthbotProducts.map(p=>p.id)).size,35);
 assert.equal(anthbotProducts.filter(p=>p.category==="Mähroboter").length,19);
 assert.equal(anthbotProducts.filter(p=>p.category==="Zubehör").length,16);
 assert.equal(anthbotFeedSnapshot,"16.10.2026");
 for(const p of anthbotProducts){
  assert.match(p.id,/^\d{14}$/);
  assert.ok(p.name&&p.description);
  assert.ok(p.priceCents>0);
  assert.ok(!/shipping protection|geschenkkarte|gift card|differenzgebühr|4g service/i.test(p.name));
  const affiliate=new URL(p.affiliateUrl),target=new URL(affiliate.searchParams.get("ued")||"");
  assert.equal(affiliate.origin,"https://www.awin1.com");
  assert.equal(affiliate.pathname,"/cread.php");
  assert.equal(affiliate.searchParams.get("awinmid"),"125144");
  assert.equal(affiliate.searchParams.get("awinaffid"),"3123004");
  assert.equal(target.hostname,"de.anthbot.com");
  assert.ok(target.pathname.startsWith("/products/"));
  assert.equal(target.searchParams.get("variant"),p.id);
  assert.equal(new URL(p.image).hostname,"cdn.shopify.com");
 }
});
test("ANTHBOT search is deterministic, filters by category and uses original feed price",()=>{
 assert.equal(findAnthbotProducts().length,35);
 assert.ok(findAnthbotProducts("Genie").length>0);
 assert.equal(findAnthbotProducts("Genie","Zubehör").every(p=>p.category==="Zubehör"),true);
 assert.equal(findAnthbotProducts("no-such-anthbot").length,0);
 assert.equal(formatAnthbotPrice(109990),"1.099,90 €");
});
