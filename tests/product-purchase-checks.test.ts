import test from "node:test";
import assert from "node:assert/strict";
import {compactDescription,beautyVolume,beautySizeFamily,beautyPricePer100ml,beautyChecks,anthbotChecks,imouChecks} from "../lib/product-purchase-checks.ts";
test("single pack volumes and historical unit prices are derived only from explicit ml labels",()=>{
 assert.equal(beautyVolume("Re-construct cream 50 ml"),50);
 assert.equal(beautyVolume("Ampullenkur 7 x 2 ml"),null);
 assert.equal(beautyVolume("Peeling 12x 0,4 g"),null);
 assert.equal(beautyPricePer100ml("Cream 50 ml",13200),26400);
 assert.equal(beautyPricePer100ml("Cream 15 ml",3990),26600);
 assert.equal(beautySizeFamily("Cream 50 ml"),beautySizeFamily("Cream 15 ml"));
 assert.equal(beautySizeFamily("Cream"),null);
});
test("checks reflect labels without inventing facts",()=>{
 assert.ok(beautyChecks("AHA Peeling 30 ml","Masken & Peelings").some(x=>x.includes("Säureart")));
 assert.ok(anthbotChecks("Genie 800 | 1500m² | 4G","Mähroboter").some(x=>x.includes("1500 m²")));
 assert.ok(anthbotChecks("Generalüberholt Genie","Mähroboter").some(x=>x.includes("generalüberholt")));
 assert.ok(imouChecks("IMOU 4G Outdoor - UK","Überwachungskameras",3).some(x=>x.includes("Deutschland")));
 assert.ok(imouChecks("IMOU Micro SD","Zubehör",2).some(x=>x.includes("Modellfreigabe")));
 assert.ok(!imouChecks("IMOU Micro SD","Zubehör",2).some(x=>x.includes("Auflösung")));
});
test("meta description truncation respects maximum length",()=>{
 const text="Produktdetails und Kaufkriterien ".repeat(10);
 assert.ok(compactDescription(text).length<=155);
 assert.equal(compactDescription("Kurzer Titel"),"Kurzer Titel");
});
