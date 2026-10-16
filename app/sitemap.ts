export const dynamic = "force-static";
import type { MetadataRoute } from "next";
import { guides } from "@/lib/guides";
import {affiliateProducts,affiliateProductPath} from "@/lib/affiliate-products";
import {anthbotProducts,anthbotProductPath} from "@/lib/anthbot-products";
import {imouModels,imouModelPath} from "@/lib/imou-products";
export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://findmydup.de";
  const fixed = ["/", "/produkte/", "/anthbot/", "/imou/", "/digitale-tools/", "/digitale-tools/funnelcockpit/", "/ratgeber/", "/ueber-uns/", "/partner/", "/impressum/", "/datenschutz/"];
  return [...fixed.map(path => ({url:base+path})),
    ...guides.map(g => ({url:`${base}/ratgeber/${g.slug}/`})),
    ...affiliateProducts.map(p => ({url:base+affiliateProductPath(p)})),
    ...anthbotProducts.map(p=>({url:base+anthbotProductPath(p)})),
    ...imouModels.map(m=>({url:base+imouModelPath(m)}))];
}
