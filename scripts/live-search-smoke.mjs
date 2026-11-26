// Read-only live UI sample. Reports deployment behavior, not a catalog-wide guarantee.
import {chromium} from "playwright-core";
import {writeFile} from "node:fs/promises";
const origin="https://findmydup.de";
const cases=["Kopfhörer","Kopfhörer Audiokabel","Fernseher","Staubsauger","MacBook"];
const results=[];
const browser=await chromium.launch({headless:true});
try{
 for(const query of cases){
  const context=await browser.newContext({viewport:{width:1280,height:900}});
  const page=await context.newPage();
  const api=[];
  page.on("response",response=>{
   const url=new URL(response.url());
   if(url.origin===origin&&url.pathname.startsWith("/api/")&&url.pathname.includes("/search"))api.push({path:url.pathname,status:response.status()});
  });
  const row={query,api};
  try{
   const response=await page.goto(origin+"/suche/?q="+encodeURIComponent(query),{waitUntil:"domcontentloaded",timeout:30000});
   row.http=response?.status();
   const consent=page.getByRole("dialog",{name:"Deine Privatsphäre bei FindMyDup"});
   if(await consent.isVisible())await consent.getByRole("button",{name:"Auswahl speichern"}).click();
   await page.locator(".unified-results").waitFor({timeout:15000});
   await page.waitForFunction(()=>!document.querySelector(".unified-results-count")?.textContent?.includes("weitere werden geladen"),{},{timeout:55000});
   row.sort=await page.getByLabel("Sortieren nach").inputValue().catch(()=>null);
   row.count=await page.locator(".unified-results-count").innerText();
   row.notice=await page.locator(".unified-results-notice").allTextContents();
   row.offers=await page.locator(".unified-offer").evaluateAll(els=>els.map(e=>({title:e.querySelector("h3")?.textContent,merchant:e.getAttribute("data-source"),articleCents:e.getAttribute("data-article-cents")})));
   if(query==="Kopfhörer"){
    row.screenshotRegression={baseusCableVisible:row.offers.some(o=>/baseus yiven audiokabel/i.test(o.title??"")),usbChargerVisible:row.offers.some(o=>/usb.a ladeger.t/i.test(o.title??""))};
    await page.screenshot({path:"live-headphone-search.png",fullPage:true});
   }
  }catch(error){row.error=String(error);}
  results.push(row);
  await context.close();
 }
}finally{await browser.close();}
await writeFile("live-search-report.json",JSON.stringify({checkedAt:new Date().toISOString(),note:"Visible initial results only; merchant availability and deployment may vary.",results},null,2));
console.log(JSON.stringify(results,null,2));
