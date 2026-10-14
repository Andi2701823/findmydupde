export const dynamic = "force-static";
import type { MetadataRoute } from "next";
import { guides } from "@/lib/guides";
export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://findmydup.de";
  const fixed = ["/", "/ratgeber/", "/ueber-uns/", "/partner/", "/impressum/", "/datenschutz/"];
  return [...fixed.map(path => ({url:base+path,changeFrequency:"monthly" as const,priority:path === "/" ? 1 : 0.6})),
    ...guides.map(g => ({url:`${base}/ratgeber/${g.slug}/`,changeFrequency:"monthly" as const,priority:0.7}))];
}
