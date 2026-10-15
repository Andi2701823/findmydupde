import test from "node:test";
import assert from "node:assert/strict";
import {merchantCatalogMetadata} from "../lib/seo-catalog.ts";

const conf={
  title:"Samsung-Produkte entdecken",
  description:"Suche und filtere Samsung-Produkte.",
  canonical:"https://findmydup.de/samsung/",
};
test("unfiltered merchant landing page remains indexable and has its own canonical",()=>{
  const m=merchantCatalogMetadata({...conf,params:{}});
  assert.equal(m.robots,undefined);
  assert.deepEqual(m.alternates,{canonical:"https://findmydup.de/samsung/"});
  assert.equal(m.title,"Samsung-Produkte entdecken");
});
test("query and every merchant filter combination is noindex but still follow",()=>{
  for(const params of [
    {q:"Galaxy"},{category:"Smartphones"},{sort:"price-asc"},
    {page:"2"},{min:"100"},{max:"400"},{brand:"Samsung"},
    {q:["Galaxy","S26"]},{category:"Tablets",sort:"name",page:"3"}
  ]){
    const m=merchantCatalogMetadata({...conf,params});
    assert.deepEqual(m.robots,{index:false,follow:true},JSON.stringify(params));
    assert.equal(m.alternates,undefined,"Filtered URLs should not signal a competing canonical");
  }
});
test("unknown campaign tracking parameters alone do not deindex the canonical page",()=>{
 const m=merchantCatalogMetadata({...conf,params:{utm_source:"newsletter"}});
 assert.equal(m.robots,undefined);
 assert.equal(m.alternates?.canonical,conf.canonical);
});
