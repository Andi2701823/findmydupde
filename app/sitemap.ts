export const dynamic = "force-static";
import type { MetadataRoute } from "next";
import { guides } from "@/lib/guides";
import {affiliateProducts,affiliateProductPath} from "@/lib/affiliate-products";
export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://findmydup.de";
  const fixed = ["/", "/produkte/", "/anthbot/", "/digitale-tools/", "/digitale-tools/funnelcockpit/", "/ratgeber/", "/ueber-uns/", "/partner/", "/impressum/", "/datenschutz/"];
  return [...fixed.map(path => ({url:base+path})),
    ...guides.map(g => ({url:`${base}/ratgeber/${g.slug}/`})),
    ...affiliateProducts.map(p => ({url:base+affiliateProductPath(p)}))];
}
