export const dynamic = "force-static";
import type { MetadataRoute } from "next";
import { guides } from "@/lib/guides";
import {affiliateProducts,affiliateProductPath} from "@/lib/affiliate-products";
export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://findmydup.de";
  const fixed = ["/", "/produkte/", "/digitale-tools/", "/digitale-tools/funnelcockpit/", "/ratgeber/", "/ueber-uns/", "/partner/", "/impressum/", "/datenschutz/"];
  return [...fixed.map(path => ({url:base+path,changeFrequency:"monthly" as const,priority:path === "/" ? 1 : 0.6})),
    ...guides.map(g => ({url:`${base}/ratgeber/${g.slug}/`,changeFrequency:"monthly" as const,priority:0.7})),
    ...affiliateProducts.map(p => ({url:base+affiliateProductPath(p),changeFrequency:"monthly" as const,priority:0.6}))];
}
