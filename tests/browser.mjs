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
  // Existing affiliate consent predates Analytics. A separate Analytics choice must appear.
  const analyticsContext=await browser.newContext();
  await analyticsContext.addInitScript(()=>{
    localStorage.setItem("findmydup:affiliate-consent:v1","accepted");
    localStorage.removeItem("findmydup:analytics-consent:v1");
  });
  const analyticsPage=await analyticsContext.newPage();
  const analyticsRequests=[];
  await analyticsPage.route("https://www.googletagmanager.com/**",route=>{
    analyticsRequests.push(route.request().url());
    return route.abort();
  });
  await analyticsPage.goto(origin,{waitUntil:"domcontentloaded"});
  await analyticsPage.getByRole("dialog",{name:"Deine Privatsphäre bei FindMyDup"}).waitFor();
  assert.equal(await analyticsPage.locator('script[data-findmydup-analytics]').count(),0,
    "Google Analytics must not load before Analytics consent");
  await analyticsPage.getByRole("checkbox",{name:"Besucherstatistik mit Google Analytics erlauben"}).check();
  await analyticsPage.getByRole("button",{name:"Auswahl speichern"}).click();
  await analyticsPage.locator('script[data-findmydup-analytics]').waitFor({state:"attached"});
  assert.equal(await analyticsPage.locator('script[data-findmydup-analytics]').getAttribute("src"),
    "https://www.googletagmanager.com/gtag/js?id=G-D3QN1F7G47");
  assert.equal(await analyticsPage.evaluate(()=>localStorage.getItem("findmydup:analytics-consent:v1")),
    "accepted");
  // Google gtag.js silently ignores Array-based commands; its queue must contain
  // native Arguments objects, or Tag Assistant finds the tag but GA4 records 0 hits.
  const queued=await analyticsPage.evaluate(()=>{
    const commands=(window.dataLayer||[]).filter(item=>
      Object.prototype.toString.call(item)==="[object Arguments]");
    return {
      hasConfig:commands.some(item=>item[0]==="config" && item[1]==="G-D3QN1F7G47"),
      hasGrantedConsent:commands.some(item=>item[0]==="consent" && item[1]==="update" &&
        item[2]?.analytics_storage==="granted"),
      count:commands.length,
    };
  });
  assert.ok(queued.count>=4,"Google command queue must contain native Arguments objects");
  assert.ok(queued.hasConfig,"gtag('config') must be a recognized command");
  assert.ok(queued.hasGrantedConsent,"GA4 must receive granted Analytics consent");

  assert.ok(analyticsRequests.some(url=>url.includes("G-D3QN1F7G47")),
    "Consent must trigger the real Google Analytics tag request");
  await analyticsContext.close();
  await page.goto(origin,{waitUntil:"domcontentloaded"});
  await page.getByRole("heading",{name:"Finde Produkte. Vergleiche Preise."}).waitFor();
  await page.getByRole("link",{name:/Ratgeber lesen: Gesichtsserum vergleichen/}).waitFor();
  assert.equal(await page.locator(".product-card").count(),0);
  assert.equal(await page.getByText("Produktsuche per Foto").count(),0,
    "Do not advertise an unavailable photo search in the hero");
  assert.equal(await page.locator(".affiliate-featured").count(),0,
    "Do not highlight months-old fixed feed prices on the homepage");
  assert.equal(await page.locator(".merchant-directory-card").count(),3,
    "Homepage should link directly to existing merchant catalogs");
  assert.equal(await page.getByRole("link",{name:"IMOU entdecken"}).count(),1);
  assert.equal(await page.getByRole("link",{name:"ANTHBOT entdecken"}).count(),1);
  for(const topic of ["Mode","Beauty","Wohnen","Technik"]) {
    assert.equal(await page.locator('a.category-tile[href="/ratgeber/#'+topic.toLowerCase()+'"]').count(),1,
      "Editorial category links must lead to the matching guide section");
  }
  for(const term of ["Serum","Genie","Ranger"]) {
    assert.equal(await page.getByRole("link",{name:term+" ↗"}).count(),1,
      "Homepage search examples should have catalog matches");
  }
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
  const orgLd=JSON.parse((await page.locator('script[type="application/ld+json"]').allTextContents())[1]);
  assert.equal(orgLd["@type"],"Organization");
  assert.equal(orgLd.name,"FindMyDup");
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
  assert.equal((sitemapContent.match(/<loc>https:\/\/findmydup\.de\/anthbot\/[^<]+<\/loc>/g)||[]).length,35,
   "All 35 ANTHBOT product pages must be in the XML sitemap");
  assert.equal((sitemapContent.match(/<loc>https:\/\/findmydup\.de\/imou\/[^<]+<\/loc>/g)||[]).length,69,
   "XML sitemap must include all 69 IMOU grouped model pages");
  const imouCatalog=await fetch(origin+"/imou/");
  assert.equal(imouCatalog.status,200);
  const imouCatalogHtml=await imouCatalog.text();
  assert.match(imouCatalogHtml,/IMOU Überwachungskameras und Smart Home entdecken/);
  assert.match(imouCatalogHtml.replaceAll("<!-- -->",""),/69 Produktgruppen/);
  const modelPage=await fetch(origin+"/imou/imou-ranger-2c-wifi-security-surveillance-camera-8143695413560/");
  assert.equal(modelPage.status,200,"The first IMOU model route is a real product detail page");
  const modelHtml=await modelPage.text();
  assert.match(modelHtml,/IMOU Ranger 2C/);
  assert.match(modelHtml,/16\.10\.2026/);
  assert.match(modelHtml,/m=125816/);
  const missingModel=await fetch(origin+"/imou/not-a-real-model-1234567890123/");
  assert.equal(missingModel.status,404);
  const imouSearch=await fetch(origin+"/api/imou/search/?q=Ranger");
  assert.equal(imouSearch.status,200);
  const imouJson=await imouSearch.json();
  assert.equal(imouJson.source,"imou");
  assert.ok(imouJson.products.length>0&&imouJson.products.length<=24);
  assert.equal(imouSearch.headers.get("cache-control"),"no-store");
  const anthbotHome=await fetch(origin+"/anthbot/");
  assert.equal(anthbotHome.status,200,"ANTHBOT catalog route must be reachable");
  const anthbotHtml=await anthbotHome.text();
  assert.match(anthbotHtml,/ANTHBOT Mähroboter und Zubehör entdecken/);
  assert.match(anthbotHtml,/\/anthbot\/5-klingenscheibe-50042633781561\//);
  const anthbotDetail=await fetch(origin+"/anthbot/5-klingenscheibe-50042633781561/");
  assert.equal(anthbotDetail.status,200,"ANTHBOT variant page must be directly loadable");
  const detailHtml=await anthbotDetail.text();
  assert.match(detailHtml,/<h1[^>]*>5-Klingenscheibe<\/h1>/);
  assert.match(detailHtml,/Produktdetails|Herstellerinformationen|HERSTELLERINFORMATIONEN/);
  assert.match(detailHtml,/canonical/);
  const invalidAnthbot=await fetch(origin+"/anthbot/not-a-valid-product-00000000000000/");
  assert.equal(invalidAnthbot.status,404);
 
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
  await page.goto(`${origin}/ratgeber/gesichtsserum-vergleichen/`,{waitUntil:"domcontentloaded"});
  await page.locator('script[type="application/ld+json"]').first().waitFor({state:"attached"});
  const guideSchemas=await page.locator('script[type="application/ld+json"]').allTextContents();
  assert.equal(guideSchemas.length,2,"Guides emit Breadcrumb and Article JSON-LD");
  const guideArticle=JSON.parse(guideSchemas[1]);
  assert.equal(guideArticle["@type"],"Article");
  assert.equal(guideArticle.author.name,"FindMyDup");
  assert.equal(guideArticle.publisher.name,"FindMyDup");
  assert.equal(guideArticle.datePublished,undefined,"No invented original publication date");
  assert.equal(guideArticle.dateModified,undefined,"No invented modified date");
  assert.equal(await page.getByRole("heading",{name:"Passende Beauty-Produkte entdecken"}).count(),1);
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
  assert.equal(await page.locator('.reifen-ads').count(),1,"One partner advertising area");
  assert.equal(await page.locator('.reifen-ads a[href*="awin1.com/cread.php"]').count(),1,
    "Only one advertising link visible at any time");
  assert.equal(await page.locator('.reifen-ads .partner-banner-controls button').count(),3,
    "Visitors may navigate or pause rotating banners");
  // Use an isolated browser page and shortened banner-only timers to verify that
  // the automatic rotation continues even while a control is focused or hovered.
  const bannerContext = await browser.newContext({viewport:{width:1024,height:720}});
  await bannerContext.addInitScript(() => {
    localStorage.setItem("findmydup:affiliate-consent:v1", "rejected");
    localStorage.setItem("findmydup:analytics-consent:v1", "rejected");
    const originalTimeout = window.setTimeout.bind(window);
    window.setTimeout = (callback,delay,...args) => originalTimeout(callback, delay===10000 ? 1100 : delay, ...args);
  });
  const bannerPage = await bannerContext.newPage();
  await bannerPage.goto(origin+"/produkte/",{waitUntil:"domcontentloaded"});
  const bannerLabel = bannerPage.locator(".reifen-ads-label");
  const nextBanner = bannerPage.getByRole("button",{name:"Nächster Werbebanner"});
  const pauseBanner = bannerPage.getByRole("button",{name:"Bannerrotation pausieren"});
  await bannerLabel.waitFor();
  assert.equal(await bannerLabel.innerText(),"Anzeige · Reifen.com","Banner rotation begins with a stable first item");
  const bannerClick=bannerPage.locator(".reifen-ads-grid a");
  assert.match(await bannerClick.getAttribute("href"),/s=3855040/);
  assert.ok((await bannerPage.locator(".partner-banner-text").first().evaluate(el=>getComputedStyle(el).lineHeight))!=="0px",
    "Consent placeholder remains readable");
  await nextBanner.click();
  assert.equal(await bannerLabel.innerText(),"Anzeige · Samsung Shop DE","Manual next changes advertiser, not just creative");
  await nextBanner.click();
  assert.equal(await bannerLabel.innerText(),"Anzeige · MacTrade");
  await pauseBanner.click();
  assert.equal(await bannerPage.getByRole("button",{name:"Bannerrotation fortsetzen"}).count(),1);
  await bannerPage.waitForTimeout(1600);
  assert.equal(await bannerLabel.innerText(),"Anzeige · MacTrade","Explicit pause stops the timer");
  await bannerPage.getByRole("button",{name:"Bannerrotation fortsetzen"}).click();
  // Focus from the pause/resume button must not silently disable the rotation.
  await bannerPage.waitForFunction(
    () => document.querySelector(".reifen-ads-label")?.textContent==="Anzeige · Reifen.com",
    undefined,{timeout:4000}
  );
  await nextBanner.hover();
  // A visitor hovering over controls must still see automatic changes.
  await bannerPage.waitForFunction(
    () => document.querySelector(".reifen-ads-label")?.textContent==="Anzeige · MacTrade",
    undefined,{timeout:4000}
  );
  await bannerContext.close();
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
  assert.equal(seoJson.length,2,"Product pages emit breadcrumbs and descriptive Product data");
  const breadcrumbSchema=JSON.parse(seoJson[0]);
  assert.equal(breadcrumbSchema["@type"],"BreadcrumbList");
  assert.equal(breadcrumbSchema.itemListElement.length,3);
  assert.equal(breadcrumbSchema.itemListElement[2].name,"DermaLumin-C Melanin Correcting Serum");
  const productSchema=JSON.parse(seoJson[1]);
  assert.equal(productSchema["@type"],"Product");
  assert.equal(productSchema.name,"DermaLumin-C Melanin Correcting Serum");
  assert.ok(productSchema.image[0].includes("bdr-beauty.com"));
  assert.equal(productSchema.offers,undefined,"Never publish stale feed data as live offers");
  assert.equal(productSchema.review,undefined,"No invented reviews");
  assert.equal(productSchema.aggregateRating,undefined,"No invented ratings");
  // Contact details must consistently use the new public support mailbox.
  for(const route of ["/ueber-uns/","/partner/","/impressum/","/datenschutz/"]){
    const response=await fetch(origin+route);
    assert.equal(response.status,200);
    const content=await response.text();
    assert.match(content,/support@findmydup\.de/);
    assert.ok(!content.includes("andreas.paul4282@gmail.com"),"Old personal mailbox is not displayed on "+route);
  }
  await page.goto(origin+"/",{waitUntil:"domcontentloaded"});
  assert.equal(await page.locator('footer a[href="mailto:support@findmydup.de"]').count(),1,
   "Footer contact link points to dedicated support mailbox");
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
      if(route === "/produkte/"){
        const directory=page.locator(".merchant-directory-grid");
        const cards=directory.locator(".merchant-directory-card");
        assert.ok(await cards.count()>=3,"Merchant directory must display IMOU, ANTHBOT and bdr-beauty");
        assert.equal(await directory.locator('a[href="/imou/"]').count(),1);
        assert.equal(await directory.locator('a[href="/anthbot/"]').count(),1);
        assert.equal(await directory.locator('a[href="#beauty-catalog-heading"]').count(),1);
        const columns=await directory.evaluate(el=>getComputedStyle(el).gridTemplateColumns.split(/\s+/).filter(Boolean).length);
        assert.equal(columns,width>=1051?3:width>=601?2:1,
          "Merchant grid must have 3 desktop, 2 tablet, or 1 mobile column at "+width+"px");
      }
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
  const allowedAwinBannerIds = new Map([
    ["3855040",["7605","403450"]],["3855041",["7605","403450"]],
    ["3820327",["14815","381849"]],["2481981",["13737","372932"]],
    ["2481968",["13737","372932"]],
  ]);
  const permittedAwinBanner = raw => {
    const url = new URL(raw);
    const expected = allowedAwinBannerIds.get(url.searchParams.get("s"));
    return url.protocol === "https:" && url.hostname === "www.awin1.com" &&
      url.pathname === "/cshow.php" && expected &&
      url.searchParams.get("v") === expected[0] && url.searchParams.get("q") === expected[1] &&
      url.searchParams.get("r") === "3123004" && url.searchParams.size === 4;
  };
  assert.deepEqual(remoteRequests.filter(url => new URL(url).hostname !== "bdr-beauty.com" &&
    !permittedFunnelScreenshots.has(url) && !permittedAwinBanner(url)),[]);
  assert.deepEqual(uploads,[]);
  console.log("PASS: public editorial home, real guide search and categories, 8 published articles, saved reading list, legal and partner routes, SEO sitemap, Awin verification, mobile breakpoints and no remote requests.");
} catch(error) {
  mkdirSync("test-artifacts",{recursive:true});
  if(page&&!page.isClosed())await page.screenshot({path:"test-artifacts/failure.png",fullPage:true}).catch(()=>{});
  throw error;
} finally {await browser?.close();server.kill();}
