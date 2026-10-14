import test from "node:test";
import assert from "node:assert/strict";
import { guides, guideCategories, searchGuides, findGuide } from "../lib/guides.ts";
test("eight genuine editorial guides with unique valid slugs across four categories",()=>{
  assert.equal(guides.length,8);
  assert.equal(new Set(guides.map(g=>g.slug)).size,8);
  for(const category of guideCategories)assert.equal(guides.filter(g=>g.category===category).length,2);
  for(const guide of guides) {
    assert.match(guide.slug,/^[a-z0-9-]+$/);
    assert.equal(findGuide(guide.slug),guide);
    assert.ok(guide.sections.length>=3);
    for(const section of guide.sections)assert.ok(section.paragraphs.join(" ").length>=140);
  }
});
test("the public search operates on real editorial text rather than fake product prices",()=>{
  assert.equal(searchGuides(""),guides.length ? guides : []);
  assert.deepEqual(searchGuides("serum").map(g=>g.slug),["gesichtsserum-vergleichen"]);
  assert.deepEqual(searchGuides("KOPFHÖRER").map(g=>g.slug),["kopfhoerer-vergleichen"]);
  assert.equal(searchGuides("Technik").length,2);
  assert.equal(searchGuides("", "Beauty").length,2);
  assert.equal(searchGuides("xyznevermatching").length,0);
  assert.equal(guides.some(g=>/demo|erfunden|fiktiv/i.test(g.title)),false);
});
