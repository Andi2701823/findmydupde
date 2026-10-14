import test from "node:test";
import assert from "node:assert/strict";
import { affiliateProducts,affiliateFeedImported,findAffiliateProducts,formatFeedPrice } from "../lib/affiliate-products.ts";
test("Awin bdr-beauty feed contains 63 unique genuine products",()=>{
  assert.equal(affiliateProducts.length,63);
  assert.equal(new Set(affiliateProducts.map(p=>p.id)).size,63);
  assert.equal(affiliateFeedImported,"25.06.2026");
  for(const product of affiliateProducts){
    assert.ok(product.name.trim());
    assert.ok(product.priceCents>0);
    assert.equal(product.merchant,"bdr-beauty DE");
    assert.equal(new URL(product.image).hostname,"bdr-beauty.com");
    const url=new URL(product.affiliateUrl);
    assert.equal(url.protocol,"https:");
    assert.equal(url.hostname,"www.awin1.com");
    assert.equal(url.pathname,"/pclick.php");
    assert.equal(url.searchParams.get("a"),"3123004");
    assert.equal(url.searchParams.get("m"),"125128");
    assert.match(url.searchParams.get("p")||"",/^451332895[0-9]{2}$/);
  }
});
test("Beauty product search and German price formatting",()=>{
  assert.ok(findAffiliateProducts("serum").length>5);
  assert.ok(findAffiliateProducts("maske","Masken & Peelings").length>0);
  assert.equal(findAffiliateProducts("ZZZ-NOT-FOUND").length,0);
  assert.equal(formatFeedPrice(3950),"39,50 €");
  assert.equal(affiliateProducts.find(p=>p.id==="1815")?.priceCents,36000);
});

import { affiliateDescriptions } from "../lib/affiliate-descriptions.ts";
import { affiliateProductPath, affiliateProductSlug, findAffiliateProductBySlug } from "../lib/affiliate-products.ts";
test("all 63 product detail pages have unique SEO slugs and sourced descriptions",()=>{
  assert.equal(Object.keys(affiliateDescriptions).length,63);
  assert.equal(new Set(affiliateProducts.map(affiliateProductSlug)).size,63);
  for(const p of affiliateProducts){
    const url=affiliateProductPath(p);
    assert.match(url,/^\/produkte\/[a-z0-9-]+\/$/);
    assert.equal(findAffiliateProductBySlug(affiliateProductSlug(p))?.id,p.id);
    assert.ok(affiliateDescriptions[p.id]?.length>=300,`No substantial merchant description for ${p.id}`);
  }
  assert.equal(findAffiliateProductBySlug("no-such-product"),undefined);
});
