import test from "node:test";
import assert from "node:assert/strict";
import {parseSamsungCsv,parseSamsungMoney,samsungFeedCategory} from "../lib/samsung-feed-utils.ts";
test("comma, double quote and unicode CSV handling",()=>{
  const rows=parseSamsungCsv('name,price\r\n"Galaxy, ""edition""",99.90\r\nSamsung Kühlschrank,300.00\r\n');
  assert.deepEqual(rows,[["name","price"],['Galaxy, "edition"',"99.90"],["Samsung Kühlschrank","300.00"]]);
});
test("safe cents and invalid prices",()=>{
  assert.equal(parseSamsungMoney("39.90"),3990);
  assert.equal(parseSamsungMoney("0.99"),99);
  assert.equal(parseSamsungMoney("99"),9900);
  assert.throws(()=>parseSamsungMoney("1,99"));
});
test("real semantic categories outrank unhelpful Awin labels",()=>{
  assert.equal(samsungFeedCategory("Samsung Silicone Case für Galaxy S26","IT - Mobile"),"Zubehör");
  assert.equal(samsungFeedCategory("Samsung Galaxy S26 Ultra 512 GB","IT - Mobile"),"Smartphones");
  assert.equal(samsungFeedCategory('85" Mini LED Samsung Smart TV',"Devices"),"Fernseher");
  assert.equal(samsungFeedCategory("Samsung The Frame Rahmen 55 Zoll","Television"),"Zubehör");
  assert.equal(samsungFeedCategory("Samsung 27\" Odyssey Gaming Monitor","Devices"),"Monitore");
  assert.equal(samsungFeedCategory("Samsung RS70F Side-by-Side Kühlschrank","Devices"),"Haushaltsgeräte");
});
