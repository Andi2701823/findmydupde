import test from "node:test";
import assert from "node:assert/strict";
import {relevantMacbookPage} from "../lib/relevant-device-pages.ts";
import {macbookComputerIntent,relevantTitle} from "../lib/unified-offers.ts";

type Item={product_name:string;price_cents:number;aw_product_id:string};
const accessories=(start:number,n:number):Item[]=>Array.from({length:n},(_,i)=>({
 product_name:"MacBook USB-C Hub Adapter für Notebook "+(start+i),
 price_cents:300+i*20,aw_product_id:String(start+i)
}));
const devices=(start:number,n:number):Item[]=>Array.from({length:n},(_,i)=>({
 product_name:"Apple MacBook Air 13 M5 16 GB "+(256+i)+" GB SSD - Kein Netzteil",
 price_cents:98000+i*500,aw_product_id:String(start+i)
}));
test("MacBook search scans beyond cheapest 24 accessory rows and returns only genuine laptops",async()=>{
 const input=[...accessories(1000,28),...devices(2000,32)];
 let pages:number[]=[];
 const result=await relevantMacbookPage("MacBook",async page=>{
  pages.push(page);
  return {products:input.slice((page-1)*24,page*24),total:input.length,page};
 });
 assert.deepEqual(pages,[1,2,3]);
 assert.equal(result.products.length,24);
 assert.ok(result.products.every(p=>relevantTitle(p.product_name,"MacBook")));
 assert.equal(result.products[0].price_cents,98000);
});
test("Only explicit computer intent does additional feed reads, accessory search stays usable",async()=>{
 assert.equal(macbookComputerIntent("MacBook"),true);
 assert.equal(macbookComputerIntent("MacBook Pro"),true);
 assert.equal(macbookComputerIntent("MacBook Tasche"),false);
 assert.equal(macbookComputerIntent("MacBook USB-C Adapter"),false);
 let calls=0;
 const result=await relevantMacbookPage("MacBook Tasche",async page=>{
  calls++;
  return {products:accessories(3000,24),total:200,page};
 });
 assert.equal(calls,1);
 assert.equal(result.products.length,24);
});
test("Empty MacBook results stop after a bounded number of pages",async()=>{
 let calls=0;
 const result=await relevantMacbookPage("MacBook",async page=>{
  calls++;
  return {products:accessories(page*100,24),total:2000,page};
 });
 assert.equal(result.products.length,0);
 assert.equal(calls,5);
});
