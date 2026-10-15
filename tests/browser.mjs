import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";
import { chromium } from "playwright-core";
const port = 3217, origin = `http://127.0.0.1:${port}`;
const server = spawn(process.execPath,["node_modules/next/dist/bin/next","start","--port",String(port),"--hostname","127.0.0.1"],{stdio:"ignore"});
let browser, page;
try {
  let ready=false;
  for(let i=0;i<120;i++){try {if((await fetch(origin)).ok){ready=true;break;}}catch{}await new Promise(r=>setTimeout(r,100));}
  if(!ready)throw new Error("Next.js test server did not start");
  const macChrome="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
  browser=await chromium.launch({headless:true,...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:existsSync(macChrome)?{executablePath:macChrome}:{})});
  const context=await browser.newContext({viewport:{width:1440,height:1000}});
  page=await context.newPage();
  const errors=[],remoteRequests=[],uploads=[];
  page.on("pageerror",e=>errors.push(e.message));
  page.on("request",request=>{
    if(/^https?:/.test(request.url())&&!request.url().startsWith(origin))remoteRequests.push(request.url());
    if(!["GET","HEAD"].includes(request.method()))uploads.push(request.url());
  });
  await page.goto(origin,{waitUntil:"domcontentloaded"});
  await page.getByRole("heading",{name:"Finde Produkte. Entdecke mehr."}).waitFor();
  await page.getByRole("link",{name:/Ratgeber lesen: Gesichtsserum vergleichen/}).waitFor();
  assert.equal(await page.locator(".product-card").count(),0);
  assert.equal(await page.getByText("Produktsuche per Foto").count(),1);
  assert.equal(await page.locator("input[type=file]").count(),0,"Never imply photo recognition is already enabled");
  assert.equal(await page.locator('[name="verification"][content="00fd05c1707e91d286f87c424f566383"]').count(),1);
  assert.equal(await page.locator('meta[name="google-site-verification"][content="YtCGA15drFx3pEG8yUQPmsIonnN8kDuFLIgtHicPnQY"]').count(),1);
  assert.equal(await page.locator('link[rel="icon"][href="/icon.svg"]').count(),1,"Browser tab needs branded favicon");
  const ogImage=await page.locator('meta[property="og:image"]').getAttribute("content");
  assert.equal(ogImage,"https://findmydup.de/share-image/");
  assert.equal(await page.locator('meta[name="twitter:image"]').getAttribute("content"),ogImage);
  assert.equal(await page.locator('meta[name="twitter:card"]').getAttribute("content"),"summary_large_image");
  assert.equal(await page.locator('meta[property="og:image:width"]').getAttribute("content"),"1200");
  assert.equal(await page.locator('meta[property="og:image:height"]').getAttribute("content"),"630");
  const preview=await fetch(`${origin}/share-image/`);
  assert.equal(preview.status,200,"Share preview must be publicly accessible");
  assert.match(preview.headers.get("content-type")||"",/image\/png/);
  const png=Buffer.from(await preview.arrayBuffer());
  assert.ok(png.length>5000);
  assert.equal(png.subarray(0,8).toString("hex"),"89504e470d0a1a0a");
  assert.equal(png.readUInt32BE(16),1200);
  assert.equal(png.readUInt32BE(20),630);
  const favicon = await fetch(`${origin}/icon.svg`);
  assert.equal(favicon.status,200,"Favicon asset must exist in static export");
  assert.match(favicon.headers.get("content-type")||"",/image\/svg\+xml/);
  assert.match(await favicon.text(),/viewBox="0 0 64 64"/);
  assert.equal(await page.locator('meta[name="robots"][content*="noindex"]').count(),0);
  assert.match(await page.title(),/Preise vergleichen.*günstigere Alternativen/);
  const websiteLd=JSON.parse(await page.locator('script[type="application/ld+json"]').first().innerText());
  assert.equal(websiteLd["@type"],"WebSite");
  assert.equal(websiteLd.url,"https://findmydup.de/");
  assert.equal((await fetch(`${origin}/robots.txt`).then(r=>r.text())).includes("Disallow: /"),false);
  const verification=await fetch(`${origin}/00fd05c1707e91d286f87c424f566383.html`);
  assert.equal(verification.status,200);
  assert.equal((await verification.text()).trim(),'Validation content="00fd05c1707e91d286f87c424f566383"');
  const llms=await fetch(`${origin}/llms.txt`);
  assert.equal(llms.status,200,"llms.txt must be publicly accessible");
  assert.ok((llms.headers.get("content-type")||"").startsWith("text/plain"),"llms.txt must be plaintext");
  const llmsText=await llms.text();
  assert.ok(llmsText.startsWith("# FindMyDup\n"));
  assert.ok(llmsText.includes("https://findmydup.de/suche/"));
  assert.ok(llmsText.includes("https://findmydup.de/ratgeber/handtasche-kaufen/"));
  assert.ok(llmsText.includes("noch nicht verfügbar"),"Do not claim image search is live");
  assert.ok(llmsText.includes("keine geprüften identischen"),"Do not overpromise product equivalence");
  const samsungDisabled=await fetch(`${origin}/samsung/`);
  assert.equal(samsungDisabled.status,404,"Samsung catalog must fail closed without Supabase configuration");
  const joybuyDisabled=await fetch(`${origin}/joybuy/`);
  assert.equal(joybuyDisabled.status,404,"JoyBuy catalog must fail closed before data import");
  const joybuyApiDisabled=await fetch(`${origin}/api/joybuy/search/?q=LEGO`);
  assert.equal(joybuyApiDisabled.status,404,"JoyBuy search API must stay disabled by default");
  const samsungApiDisabled=await fetch(`${origin}/api/samsung/search/?q=Galaxy`);
  assert.equal(samsungApiDisabled.status,404,"Samsung API must fail closed without Supabase configuration");
  const sitemap=await fetch(`${origin}/sitemap.xml`);
  assert.equal(sitemap.status,200);
  const sitemapContent=await sitemap.text();
  assert.match(sitemapContent,/gesichtsserum-vergleichen/);
  assert.equal((sitemapContent.match(/<loc>https:\/\/findmydup\.de\/produkte\/[^<]+<\/loc>/g)||[]).length,63);
  await page.getByRole("searchbox",{name:"Thema oder Produkt suchen"}).fill("Serum");
  await page.getByRole("button",{name:"Entdecken"}).click();
  await page.getByRole("heading",{name:"Funde zu „Serum“"}).waitFor();
  assert.equal(await page.locator('meta[name="robots"][content*="noindex"]').count(),1,
    "Internal product searches should not be indexed");
  assert.equal(await page.locator('link[rel="canonical"]').count(),0,
    "Search pages must not claim a canonical content page");
  assert.equal(await page.locator(".guide-card").count(),1);
  await page.locator(".unified-offer").first().waitFor();
  assert.equal(await page.locator(".search-source-filters").count(),0,"All-merchant results should not start with vendor tabs");
  const sortedPrices=await page.locator(".unified-offer").evaluateAll(rows=>rows.map(r=>Number(r.getAttribute("data-article-cents"))));
  assert.ok(sortedPrices.every((n,i)=>i===0||sortedPrices[i-1]<=n),"Offers are ordered by increasing article price");
  assert.ok(await page.locator(".unified-offer").first().getByText("bdr-beauty").count()>0,"Merchant is shown inside the offer");
  await page.getByRole("button",{name:/Gesichtsserum vergleichen.*merken/}).click();
  await page.getByRole("link",{name:/Ratgeber lesen: Gesichtsserum/}).click();
  await page.getByRole("heading",{name:/Gesichtsserum vergleichen/}).waitFor();
  const guideSchemas=await page.locator('script[type="application/ld+json"]').allTextContents();
  assert.equal(guideSchemas.length,1,"Guides expose one breadcrumb JSON-LD script");
  const guideBreadcrumbs=JSON.parse(guideSchemas[0]);
  assert.equal(guideBreadcrumbs["@type"],"BreadcrumbList");
  assert.equal(guideBreadcrumbs.itemListElement.length,3);
  assert.match(guideBreadcrumbs.itemListElement[2].item,/gesichtsserum-vergleichen/);
  await page.getByRole("heading",{name:"Inhaltsstoffliste richtig einordnen"}).waitFor();
  await page.getByRole("link",{name:"Merkliste"}).click();
  await page.getByRole("heading",{name:"Deine Lieblingsratgeber."}).waitFor();
  assert.equal(await page.locator(".guide-card").count(),1);
  await page.reload();
  assert.equal(await page.locator(".guide-card").count(),1);
  await page.getByRole("button",{name:/Gesichtsserum vergleichen.*aus Merkliste entfernen/}).click();
  await page.getByRole("heading",{name:"Platz für deine Favoriten."}).waitFor();
  // Digital subscriptions stay separate from physical price comparisons.
  const digitalIndex=await fetch(origin+"/digitale-tools/");
  assert.equal(digitalIndex.status,200);
  const digitalPage=await fetch(origin+"/digitale-tools/funnelcockpit/");
  assert.equal(digitalPage.status,200);
  const digitalHtml=await digitalPage.text();
  assert.ok(digitalHtml.includes("https://www.digistore24.com/redir/98201/andi271982/"));
  assert.ok(digitalHtml.includes("sponsored nofollow noopener noreferrer"));
  // All visuals must be real images hosted by FunnelCockpit, not AI product mockups.
  await page.route("https://static.funnelcockpit.com/**", route => route.fulfill({
    status:200,contentType:"image/png",
    body:Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9SjlZyQAAAAASUVORK5CYII=","base64"),
  }));
  await page.goto(origin+"/digitale-tools/funnelcockpit/",{waitUntil:"domcontentloaded"});
  await page.getByRole("heading",{name:/FunnelCockpit: Was kann die Software/}).waitFor();
  assert.ok(!(await page.title()).includes("Erfahrungen"),"Do not imply first-hand experience in SEO title");
  const funnelLd=JSON.parse(await page.locator('script[type="application/ld+json"]').first().innerText());
  assert.equal(funnelLd["@type"],"BreadcrumbList");
  assert.equal(funnelLd.itemListElement[2].name,"FunnelCockpit");
  const screenshotNodes=page.locator(".digital-tool-screenshot img");
  assert.equal(await screenshotNodes.count(),3,"Three provider-sourced images illustrate the digital tool");
  assert.ok((await screenshotNodes.evaluateAll(nodes=>nodes.map(n=>n.getAttribute("alt")))).every(alt=>alt&&alt.length>20));
  assert.ok((await screenshotNodes.evaluateAll(nodes=>nodes.map(n=>n.getAttribute("src")))).every(src=>src.startsWith("https://static.funnelcockpit.com/upload/")));
  assert.equal(await page.locator("#funktionen .digital-feature-list>div").count(),4);
  assert.equal(await page.locator("#fragen .digital-tool-faq>div").count(),5);
  assert.equal(await page.locator(".digital-price-grid>div").count(),3);
  assert.ok((await page.locator("main").innerText()).includes("kein eigener Praxistest")||
            (await page.locator("main").innerText()).includes("nicht auf einem eigenen Praxistest"));
  assert.equal(await page.locator('a[href="https://www.digistore24.com/redir/98201/andi271982/"][rel*="sponsored"]').count(),2);
  for(const width of [375,390,768,1440]){
    await page.setViewportSize({width,height:900});
    await page.waitForTimeout(50);
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,"FunnelCockpit content overflows at "+width+"px");
  }
  await page.setViewportSize({width:1440,height:1000});

  await page.goto(origin+"/suche/?q=FunnelCockpit",{waitUntil:"domcontentloaded"});
  await page.getByRole("heading",{name:"FunnelCockpit",exact:true}).waitFor();
  assert.equal(await page.locator(".unified-offer").count(),0,"No physical-product price rank for subscriptions");
  assert.equal(await page.locator(".digital-search-match").count(),1,"Software has one distinct search match");
  await page.goto(origin+"/produkte/",{waitUntil:"domcontentloaded"});
  assert.equal(await page.getByRole("link",{name:"Funktionen und Tarife ansehen"}).count(),1);
  await page.goto(`${origin}/suche/?q=xyzkeinerkenntdies`,{waitUntil:"domcontentloaded"});
  await page.getByText("Keine passenden Händlerangebote gefunden. Versuche einen anderen Suchbegriff.").waitFor();
  assert.equal(await page.locator(".guide-card").count(),0);
  await page.goto(`${origin}/suche/?q=Serum&source=beauty`,{waitUntil:"domcontentloaded"});
  await page.getByRole("navigation",{name:"Ergebnisse nach Quelle filtern"}).getByRole("link",{name:"Beauty-Produkte"}).waitFor();
  assert.equal(await page.locator(".search-guides").count(),0,"Beauty filter hides guides");
  assert.ok(await page.locator(".search-products .affiliate-card").count()>0,"Beauty filter retains matching offers");
  await page.getByRole("navigation",{name:"Ergebnisse nach Quelle filtern"}).getByRole("link",{name:"Ratgeber"}).click();
  await page.waitForFunction(()=>document.querySelector("nav.search-source-filters a[aria-current=\"page\"]")?.textContent?.includes("Ratgeber"));
  assert.equal(await page.locator(".search-products .affiliate-card").count(),0,"Guide filter hides Beauty offers");
  assert.ok(await page.locator(".search-guides .guide-card").count()>0,"Guide filter retains guides");
  const newSearch=page.getByRole("searchbox",{name:"Thema oder Produkt suchen"});
  await newSearch.fill("Powerbank");
  await page.getByRole("button",{name:"Neu suchen",exact:true}).click();
  await page.getByRole("heading",{name:"Funde zu „Powerbank“"}).waitFor();
  assert.ok(new URL(page.url()).searchParams.get("source")==="guides","Changing query preserves source choice");
  assert.equal(await page.getByRole("searchbox",{name:"Thema oder Produkt suchen"}).inputValue(),"Powerbank","Search field follows the result URL");
  assert.equal(await page.locator(".results-page .search-box.compact").evaluate(el=>getComputedStyle(el).position),"sticky","Search remains reachable while scrolling");
  await page.getByRole("searchbox",{name:"Thema oder Produkt suchen"}).fill("Gesichtsserum");
  await page.getByRole("button",{name:"Neu suchen",exact:true}).click();
  await page.getByRole("heading",{name:"Funde zu „Gesichtsserum“"}).waitFor();
  assert.equal(await page.getByRole("searchbox",{name:"Thema oder Produkt suchen"}).inputValue(),"Gesichtsserum","Repeat search keeps the current query in the form");
  await page.getByRole("link",{name:"Stattdessen alle Quellen durchsuchen"}).click();
  await page.getByRole("heading",{name:"Was möchtest du entdecken?"}).waitFor();
  assert.ok(!new URL(page.url()).searchParams.has("source"),"User can reset back to all merchants");
  await page.goto(`${origin}/suche/?category=Technik`,{waitUntil:"domcontentloaded"});
  assert.equal(await page.locator(".guide-card").count(),2);
  await page.goto(`${origin}/ratgeber/`,{waitUntil:"domcontentloaded"});
  assert.equal(await page.locator(".guide-card").count(),8);
  await page.goto(`${origin}/produkte/`,{waitUntil:"domcontentloaded"});
  await page.getByRole("heading",{name:"Unser Produktkatalog."}).waitFor();
  await page.waitForFunction(()=>document.querySelectorAll(".affiliate-card").length===63);
  assert.equal(await page.locator('a[rel*="sponsored"][href*="awin1.com/pclick.php"]').count(),63);

  // Compact product cards in both the catalog and search, with readable mobile columns.
  for(const [width,columns] of [[390,2],[768,3],[1024,3],[1440,4]]){
    await page.setViewportSize({width,height:900});
    for(const route of ["/produkte/","/suche/?q=Serum&source=beauty"]){
      await page.goto(origin+route,{waitUntil:"domcontentloaded"});
      await page.locator(".affiliate-grid .affiliate-card").first().waitFor();
      const layout=await page.locator(".affiliate-grid").first().evaluate(grid=>({
        columns:getComputedStyle(grid).gridTemplateColumns.trim().split(/\s+/).length,
        cardWidth:grid.querySelector(".affiliate-card").getBoundingClientRect().width,
        imageRatio:grid.querySelector(".affiliate-image").getBoundingClientRect().width/
          grid.querySelector(".affiliate-image").getBoundingClientRect().height,
        overflow:document.documentElement.scrollWidth>innerWidth
      }));
      assert.equal(layout.columns,columns,`${route}: expected ${columns} grid columns at ${width}px`);
      assert.ok(layout.cardWidth>=140,`${route}: cards must remain readable at ${width}px`);
      assert.ok(layout.imageRatio>1.3,`${route}: cards should have compact product images`);
      assert.equal(layout.overflow,false,`${route}: product grid overflows at ${width}px`);
    }
  }
  await page.setViewportSize({width:1440,height:1000});
  await page.goto(`${origin}/produkte/`,{waitUntil:"domcontentloaded"});
  await page.getByRole("searchbox",{name:"Produkte suchen"}).fill("Hyaluron");
  await page.waitForFunction(()=>document.querySelectorAll(".affiliate-card").length>0 && document.querySelectorAll(".affiliate-card").length<63);
  await page.getByRole("searchbox",{name:"Produkte suchen"}).fill("");
  await page.waitForFunction(()=>document.querySelectorAll(".affiliate-card").length===63);
  await page.goto(`${origin}/produkte/dermalumin-c-melanin-correcting-serum-1352/`,{waitUntil:"domcontentloaded"});
  await page.getByRole("heading",{name:"DermaLumin-C Melanin Correcting Serum",exact:true}).waitFor();
  assert.match(await page.locator(".product-description").innerText(),/Vitamin-C Ampullenkur/);
  assert.match(await page.locator("meta[name='description']").getAttribute("content"),/DermaLumin-C/);
  assert.equal(await page.locator("link[rel='canonical']").getAttribute("href"),
    "https://findmydup.de/produkte/dermalumin-c-melanin-correcting-serum-1352/");
  assert.equal(await page.locator("a[rel*='sponsored']").count()>0,true);
  assert.match(await page.locator('meta[property="og:image"]').getAttribute("content")||"",/bdr-beauty\.com/,"Product share preview retains product photo");
  const seoJson=await page.locator('script[type="application/ld+json"]').allTextContents();
  assert.equal(seoJson.length,1,"Do not emit ineligible Product markup for stale Awin prices");
  const breadcrumbSchema=JSON.parse(seoJson[0]);
  assert.equal(breadcrumbSchema["@type"],"BreadcrumbList");
  assert.equal(breadcrumbSchema.itemListElement.length,3);
  assert.equal(breadcrumbSchema.itemListElement[2].name,"DermaLumin-C Melanin Correcting Serum");
  assert.equal(seoJson.some(schema=>/"@type"\s*:\s*"Product"/.test(schema)),false,
    "No Product rich result without a verified current Offer, review or aggregateRating");
  await page.goto(`${origin}/ueber-uns/`,{waitUntil:"domcontentloaded"});
  await page.getByRole("heading",{name:"Mehr wissen, bevor du kaufst."}).waitFor();
  await page.goto(`${origin}/partner/`,{waitUntil:"domcontentloaded"});
  await page.getByRole("heading",{name:"Produkte verständlich und transparent präsentieren."}).waitFor();
  await page.goto(`${origin}/impressum/`,{waitUntil:"domcontentloaded"});
  assert.match(await page.locator("main").innerText(),/Andreas Paul/);
  await page.goto(`${origin}/datenschutz/`,{waitUntil:"domcontentloaded"});
  assert.match(await page.locator("main").innerText(),/Hostinger/);
  mkdirSync("test-artifacts",{recursive:true});
  for(const width of [375,390,768,1440]){
    await page.setViewportSize({width,height:900});
    for(const route of ["/","/produkte/","/produkte/dermalumin-c-melanin-correcting-serum-1352/","/ratgeber/","/ratgeber/gesichtsserum-vergleichen/","/suche/","/merkliste/","/datenschutz/","/impressum/","/ueber-uns/","/partner/"]){
      await page.goto(origin+route,{waitUntil:"domcontentloaded"});
      await page.locator("main").waitFor();
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,`${route} overflows at ${width}px`);
      if(route === "/") {
        const about=await page.locator(".about-section").boundingBox();
        const partner=await page.locator(".editorial-partner").boundingBox();
        assert.ok(about && partner,"Homepage sections should be laid out");
        assert.ok(Math.abs(about.x-partner.x)<=1,
          `Partner section must align with site shell at ${width}px (about=${about.x}, partner=${partner.x})`);
        assert.ok(Math.abs(about.width-partner.width)<=1,
          `Partner section must have same centered shell width at ${width}px`);
      }
      assert.equal(await page.locator(".product-card").count(),0);
    }
  }
  await page.setViewportSize({width:390,height:844});
  await page.goto(origin,{waitUntil:"domcontentloaded"});
  await page.getByRole("button",{name:"Menü öffnen"}).click();
  await page.getByRole("navigation",{name:"Hauptnavigation"}).getByRole("link",{name:"Ratgeber"}).click();
  await page.getByRole("heading",{name:"Bewusster wählen. Besser vergleichen."}).waitFor();
  await page.screenshot({path:"test-artifacts/guides-mobile.png",fullPage:true});
  await page.goto(origin,{waitUntil:"domcontentloaded"});
  await page.screenshot({path:"test-artifacts/home-mobile.png",fullPage:true});
  await page.setViewportSize({width:1440,height:1000});
  await page.goto(origin,{waitUntil:"domcontentloaded"});
  await page.screenshot({path:"test-artifacts/home-desktop.png",fullPage:true});
  await page.evaluate(()=>localStorage.setItem("findmydup:favorites","{invalid"));
  await page.goto(`${origin}/merkliste/`,{waitUntil:"domcontentloaded"});
  await page.getByRole("heading",{name:"Platz für deine Favoriten."}).waitFor();
  const blocked=await browser.newContext();
  await blocked.addInitScript(()=>Object.defineProperty(window,"localStorage",{get(){throw new Error("Storage blocked");}}));
  const blockedPage=await blocked.newPage();
  await blockedPage.goto(`${origin}/ratgeber/`);
  await blockedPage.getByRole("button",{name:/Gesichtsserum vergleichen.*merken/}).click();
  await blockedPage.getByRole("link",{name:"Merkliste"}).click();
  await blockedPage.getByRole("heading",{name:"Deine Lieblingsratgeber."}).waitFor();
  assert.equal(await blockedPage.locator(".guide-card").count(),1);
  assert.deepEqual(errors,[]);
  const permittedFunnelScreenshots = new Set([
    "https://static.funnelcockpit.com/upload/8e03de11-7e44-488b-90c3-eab3f513d9e3.png",
    "https://static.funnelcockpit.com/upload/RBQjxJBoixoW3jkEN/580cbfd8422d6f3773130e067efd7c7b.jpg",
    "https://static.funnelcockpit.com/upload/4b8af1d4-40fe-4433-b53e-ff972d52329f.png",
  ]);
  assert.deepEqual(remoteRequests.filter(url => new URL(url).hostname !== "bdr-beauty.com" &&
    !permittedFunnelScreenshots.has(url)),[]);
  assert.deepEqual(uploads,[]);
  console.log("PASS: public editorial home, real guide search and categories, 8 published articles, saved reading list, legal and partner routes, SEO sitemap, Awin verification, mobile breakpoints and no remote requests.");
} catch(error) {
  mkdirSync("test-artifacts",{recursive:true});
  if(page&&!page.isClosed())await page.screenshot({path:"test-artifacts/failure.png",fullPage:true}).catch(()=>{});
  throw error;
} finally {await browser?.close();server.kill();}
