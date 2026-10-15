import {readFile,stat} from "node:fs/promises";
import {parseSamsungCsv,parseSamsungMoney,samsungFeedCategory} from "../lib/samsung-feed-utils.ts";

// An authorized server-only, manual full-file Awin import. No feed download key in this script.
async function main(){
  const filename=process.argv[2];
  const confirm=process.argv.includes("--confirm");
  if(!filename||filename.startsWith("--"))throw Error("Specify a local Samsung CSV file");
  const file=await stat(filename);
  if(!file.isFile()||file.size>10*1024*1024)throw Error("Invalid or oversized input file");
  const text=(await readFile(filename,"utf8")).replace(/^\uFEFF/,"");
  const [headers,...raw]=parseSamsungCsv(text);
  const expected=["aw_deep_link","product_name","aw_product_id","merchant_product_id","merchant_image_url","description","merchant_category","search_price","merchant_name","merchant_id","currency","delivery_cost","data_feed_id"];
  if(!headers||expected.some(k=>!headers.includes(k)))throw Error("Unexpected CSV schema");
  if(raw.length<100||raw.length>10000)throw Error("Suspicious feed row count");
  const index=Object.fromEntries(headers.map((key,i)=>[key,i]));
  const get=(row:string[],key:string)=>row[index[key]]||"";
  const seen=new Set<string>();
  const rows=raw.map(row=>{
    if(row.length!==headers.length)throw Error("Malformed CSV record");
    const aw_product_id=get(row,"aw_product_id");
    const merchant_product_id=get(row,"merchant_product_id");
    const product_name=get(row,"product_name");
    const source=get(row,"merchant_category");
    const image_url=get(row,"merchant_image_url");
    const affiliate_url=get(row,"aw_deep_link");
    if(get(row,"merchant_name")!=="Samsung Shop DE"||get(row,"merchant_id")!=="14815"||
       get(row,"data_feed_id")!=="33871"||get(row,"currency")!=="EUR")throw Error("Unapproved merchant or currency");
    if(!/^\d{1,20}$/.test(aw_product_id)||seen.has(aw_product_id))throw Error("Invalid or duplicate Awin ID");
    if(merchant_product_id.length<1||merchant_product_id.length>160||product_name.length<2||product_name.length>300)throw Error("Invalid product identity");
    if(affiliate_url!==`https://www.awin1.com/pclick.php?p=${aw_product_id}&a=3123004&m=14815`)throw Error("Invalid affiliate destination");
    if(!/^https:\/\/(images\.samsung\.com|dashboard\.feedspark\.com)\//.test(image_url))throw Error("Unapproved image host");
    const price_cents=parseSamsungMoney(get(row,"search_price"));
    const delivery_cents=parseSamsungMoney(get(row,"delivery_cost"));
    if(price_cents===null||delivery_cents!==null&&delivery_cents>10_000_000)throw Error("Invalid product price");
    seen.add(aw_product_id);
    return {
      aw_product_id,merchant_product_id,product_name,
      description:get(row,"description").slice(0,1500),category:samsungFeedCategory(product_name,source),
      merchant_category:source,price_cents,delivery_cents,image_url,affiliate_url,
      merchant_name:"Samsung Shop DE",merchant_id:"14815",feed_id:"33871",currency:"EUR",published:true
    };
  });
  if(!confirm){
    console.log(`DRY RUN: validated ${rows.length} Samsung offers. No database changes.`);
    return;
  }
  if(process.env.SAMSUNG_FEED_IMPORT_ENABLED!=="true"||
     (process.env.DEPLOYMENT_ENV==="production"&&process.env.SAMSUNG_IMPORT_PRODUCTION_ENABLED!=="true"))
    throw Error("Feed import not authorized");
  const base=(process.env.SAMSUNG_SUPABASE_URL||"").replace(/\/$/,"");
  const key=process.env.SAMSUNG_SUPABASE_SERVICE_ROLE_KEY||"";
  if(!/^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(base)||key.length<25)throw Error("Supabase importer credentials absent");
  for(let i=0;i<rows.length;i+=100){
    const headers:Record<string,string>={
      apikey:key,"content-type":"application/json",Prefer:"resolution=merge-duplicates,return=minimal"
    };
    if(key.startsWith("eyJ"))headers.Authorization="Bearer "+key;
    const response=await fetch(base+"/rest/v1/samsung_feed_products?on_conflict=aw_product_id",{
      method:"POST",headers,body:JSON.stringify(rows.slice(i,i+100)),signal:AbortSignal.timeout(30000)
    });
    if(!response.ok)throw Error("Supabase rejected batch starting at row "+i+" (status "+response.status+")");
  }
  console.log(`IMPORTED: ${rows.length} validated Samsung products. No missing offers were unpublished.`);
}
main().catch(()=>{console.error("Samsung import failed. Credentials and source data were not logged.");process.exitCode=1;});
