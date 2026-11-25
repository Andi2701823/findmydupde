export const dynamic = "force-dynamic";
import type { MetadataRoute } from "next";
import { guides } from "@/lib/guides";
import {affiliateProducts,affiliateProductPath} from "@/lib/affiliate-products";
import {anthbotProducts,anthbotProductPath} from "@/lib/anthbot-products";
import {imouModels,imouModelPath} from "@/lib/imou-products";
import {samsungCatalogEnabled} from "@/lib/samsung-catalog";
import {joybuyCatalogEnabled} from "@/lib/joybuy-catalog";
import {mactradeCatalogEnabled} from "@/lib/mactrade-catalog";
import {shoppingCategories,categoryPath} from "@/lib/shopping-categories";
export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://findmydup.de";
  const fixed = ["/", "/kategorien/", "/produkte/", "/anthbot/", "/imou/", "/digitale-tools/", "/digitale-tools/funnelcockpit/", "/ratgeber/", "/ueber-uns/", "/partner/", "/impressum/", "/datenschutz/"];
  if(samsungCatalogEnabled()) fixed.push("/samsung/");
  if(joybuyCatalogEnabled()) fixed.push("/joybuy/");
  if(mactradeCatalogEnabled()) fixed.push("/mactrade/");
  return [...fixed.map(path => ({url:base+path})),
    ...shoppingCategories.map(c=>({url:base+categoryPath(c.slug)})),
    ...guides.map(g => ({url:`${base}/ratgeber/${g.slug}/`})),
    ...affiliateProducts.map(p => ({url:base+affiliateProductPath(p)})),
    ...anthbotProducts.map(p=>({url:base+anthbotProductPath(p)})),
    ...imouModels.map(m=>({url:base+imouModelPath(m)}))];
}
