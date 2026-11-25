import test from "node:test";
import assert from "node:assert/strict";
import { guides, guideCategories, searchGuides, findGuide } from "../lib/guides.ts";
test("fifteen genuine editorial guides with unique valid slugs across six categories",()=>{
  assert.equal(guides.length,15);
  assert.equal(new Set(guides.map(g=>g.slug)).size,15);
  for(const category of guideCategories)assert.ok(guides.some(g=>g.category===category));
  for(const guide of guides) {
    assert.match(guide.slug,/^[a-z0-9-]+$/);
    assert.equal(findGuide(guide.slug),guide);
    assert.ok(guide.sections.length>=3);
    for(const section of guide.sections)assert.ok(section.paragraphs.join(" ").length>=140);
  }
});
test("the public search operates on real editorial text rather than fake product prices",()=>{
  assert.deepEqual(searchGuides(""), guides);
  assert.deepEqual(searchGuides("serum").map(g=>g.slug),["gesichtsserum-vergleichen"]);
  assert.deepEqual(searchGuides("KOPFHÖRER").map(g=>g.slug),["kopfhoerer-vergleichen"]);
  assert.equal(searchGuides("Technik").length,7);
  assert.equal(searchGuides("", "Beauty").length,2);
  assert.equal(searchGuides("xyznevermatching").length,0);
  assert.equal(guides.some(g=>/demo|erfunden|fiktiv/i.test(g.title)),false);
});

test("new buying guides have traceable sources and valid topic links",()=>{
 for(const g of guides.slice(8)){assert.ok(g.sources?.length);assert.ok(g.sources.every(s=>s.url.startsWith("https://")));}
 assert.ok(findGuide("maehroboter-ohne-begrenzungskabel"));
 assert.ok(findGuide("funnelcockpit-kosten-planen")?.links?.some(l=>l.href==="/digitale-tools/funnelcockpit/"));
});
