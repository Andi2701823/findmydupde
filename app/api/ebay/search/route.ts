import "server-only";
import { createRateLimiter, requestQuotaKey } from "@/server/http/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const allow = createRateLimiter();
const responseHeaders = { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" };
type EbayItem = {
  itemId?: string;
  title?: string;
  image?: { imageUrl?: string };
  price?: { value?: string; currency?: string };
  itemWebUrl?: string;
  itemAffiliateWebUrl?: string;
  condition?: string;
  seller?: { username?: string };
  shippingOptions?: Array<{ shippingCost?: { value?: string; currency?: string } }>;
};
let cachedToken: { value: string; expires: number } | undefined;

function outbound(value: unknown): string | null {
  if (typeof value !== "string") return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && (url.hostname === "ebay.com" || url.hostname.endsWith(".ebay.com")) ? url.toString() : null;
  } catch { return null; }
}

async function token(): Promise<string> {
  if (cachedToken && cachedToken.expires > Date.now() + 60_000) return cachedToken.value;
  const id = process.env.EBAY_CLIENT_ID;
  const secret = process.env.EBAY_CLIENT_SECRET;
  if (!id || !secret) throw new Error("not configured");
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 7000);
  try {
    const reply = await fetch("https://api.ebay.com/identity/v1/oauth2/token", {
      method: "POST",
      headers: {
        Authorization: "Basic " + Buffer.from(id + ":" + secret).toString("base64"),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        scope: "https://api.ebay.com/oauth/api_scope",
      }),
      signal: controller.signal,
      cache: "no-store",
    });
    if (!reply.ok) throw new Error("token unavailable");
    const data: unknown = await reply.json();
    if (!data || typeof data !== "object" || !("access_token" in data) ||
        typeof data.access_token !== "string" || !("expires_in" in data) ||
        typeof data.expires_in !== "number") throw new Error("invalid token");
    cachedToken = { value: data.access_token, expires: Date.now() + data.expires_in * 1000 };
    return cachedToken.value;
  } finally { clearTimeout(timeout); }
}

export async function GET(request: Request) {
  if (process.env.DEPLOYMENT_ENV !== "staging" || process.env.EBAY_SEARCH_ENABLED !== "true") {
    return Response.json({ error: "EBAY_DISABLED" }, { status: 503, headers: responseHeaders });
  }
  if (!allow(requestQuotaKey(request, process.env.TRUST_PROXY_HEADERS === "true"))) {
    return Response.json({ error: "RATE_LIMITED" }, { status: 429, headers: { ...responseHeaders, "Retry-After": "60" } });
  }
  const url = new URL(request.url);
  const q = url.searchParams.get("q")?.trim() ?? "";
  if (request.url.length > 2048 || q.length < 2 || q.length > 120 || /[\x00-\x1f\x7f]/.test(q)) {
    return Response.json({ error: "INVALID_SEARCH" }, { status: 400, headers: responseHeaders });
  }
  const campaign = process.env.EBAY_EPN_CAMPAIGN_ID?.trim();
  if (campaign && !/^\d{10}$/.test(campaign)) {
    return Response.json({ error: "EBAY_CONFIG_INVALID" }, { status: 503, headers: responseHeaders });
  }
  const market = process.env.EBAY_MARKETPLACE_ID === "EBAY_DE" ? "EBAY_DE" : "EBAY_US";
  const searchUrl = new URL("https://api.ebay.com/buy/browse/v1/item_summary/search");
  searchUrl.searchParams.set("q", q);
  searchUrl.searchParams.set("limit", "10");
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const accessToken = await token();
    const headers: Record<string, string> = {
      Authorization: "Bearer " + accessToken,
      "X-EBAY-C-MARKETPLACE-ID": market,
      Accept: "application/json",
    };
    if (campaign) headers["X-EBAY-C-ENDUSERCTX"] = "affiliateCampaignId=" + campaign;
    const reply = await fetch(searchUrl, { headers, signal: controller.signal, cache: "no-store" });
    if (!reply.ok) throw new Error("browse unavailable");
    const body: unknown = await reply.json();
    if (!body || typeof body !== "object" || !("itemSummaries" in body) ||
        !Array.isArray(body.itemSummaries)) throw new Error("invalid browse response");
    const items = (body.itemSummaries as EbayItem[]).flatMap((item) => {
      const price = Number(item.price?.value);
      const imageUrl = item.image?.imageUrl;
      const url = outbound(campaign ? item.itemAffiliateWebUrl : item.itemWebUrl);
      if (!item.itemId || !item.title || !Number.isFinite(price) || price < 0 ||
          !item.price?.value || !item.price.currency || !url ||
          !imageUrl?.startsWith("https://i.ebayimg.com/")) return [];
      return [{
        source: "ebay" as const,
        externalId: item.itemId,
        title: item.title,
        imageUrl,
        price,
        currency: item.price.currency,
        retailer: "eBay",
        outboundUrl: url,
        affiliate: Boolean(campaign),
        condition: item.condition ?? null,
        seller: item.seller?.username ?? null,
        shippingCost: item.shippingOptions?.[0]?.shippingCost ?? null,
        priceObservedAt: new Date().toISOString(),
      }];
    });
    return Response.json({ source: "ebay", marketplace: market, query: q, items }, { headers: responseHeaders });
  } catch {
    return Response.json({ error: "EBAY_UNAVAILABLE", message: "eBay-Angebote sind derzeit nicht verfügbar." }, { status: 503, headers: responseHeaders });
  } finally { clearTimeout(timeout); }
}
