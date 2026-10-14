"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { SearchBox } from "./search-box";
import { Icon } from "./icon";

type EbayOffer = {
  source: "ebay";
  externalId: string;
  title: string;
  imageUrl: string;
  price: number;
  currency: string;
  retailer: "eBay";
  outboundUrl: string;
  affiliate: boolean;
  condition: string | null;
  seller: string | null;
  shippingCost: { value?: string; currency?: string } | null;
  priceObservedAt: string;
};
type EbayResponse = { source: "ebay"; marketplace: "EBAY_US" | "EBAY_DE"; items: EbayOffer[] };

function validUrl(value: unknown, host: string): value is string {
  if (typeof value !== "string") return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password && !url.port &&
      (url.hostname === host || url.hostname.endsWith("." + host));
  } catch { return false; }
}
export function validateEbayResponse(input: unknown): EbayResponse {
  if (!input || typeof input !== "object" || Array.isArray(input))
    throw new Error("invalid eBay response");
  const value = input as Partial<EbayResponse>;
  if (value.source !== "ebay" || !["EBAY_US", "EBAY_DE"].includes(value.marketplace ?? "") ||
      !Array.isArray(value.items) || value.items.length > 10)
    throw new Error("invalid eBay response");
  for (const item of value.items) {
    if (!item || item.source !== "ebay" || typeof item.externalId !== "string" ||
        !item.externalId || typeof item.title !== "string" || !item.title ||
        !Number.isFinite(item.price) || item.price < 0 ||
        !["USD", "EUR"].includes(item.currency) || item.retailer !== "eBay" ||
        typeof item.affiliate !== "boolean" || !validUrl(item.outboundUrl, "ebay.com") &&
        !validUrl(item.outboundUrl, "ebay.de") ||
        !validUrl(item.imageUrl, "i.ebayimg.com") ||
        !Number.isFinite(Date.parse(item.priceObservedAt)) ||
        (item.condition !== null && typeof item.condition !== "string") ||
        (item.seller !== null && typeof item.seller !== "string")) throw new Error("invalid eBay item");
  }
  return value as EbayResponse;
}
function format(amount: number, currency: string) {
  return new Intl.NumberFormat("de-DE", { style: "currency", currency }).format(amount);
}
function EbayCard({ item }: { item: EbayOffer }) {
  const shipping = item.shippingCost && Number(item.shippingCost.value);
  const shippingInfo = shipping !== null && shipping !== undefined &&
    Number.isFinite(shipping) && item.shippingCost?.currency === item.currency
    ? shipping === 0 ? "Versand laut Angebot kostenlos" : "Versand " + format(shipping, item.currency)
    : "Versandkosten beim Händler prüfen";
  return (
    <article className="product-card live-offer-card">
      <div className="product-art live-product-art">
        <Image src={item.imageUrl} unoptimized width={420} height={420}
          alt={item.title} loading="lazy" />
      </div>
      <div className="product-meta">
        <span>eBay {item.seller ? " / " + item.seller : ""}</span>
        <h3>{item.title}</h3>
        <div className="price-row">
          <strong>{format(item.price, item.currency)}</strong>
          <span>Angebotspreis</span>
        </div>
        <p className="live-offer-date">
          {item.condition ? item.condition + " · " : ""}{shippingInfo}
        </p>
        <p className="live-offer-date">
          Preis geprüft: {new Date(item.priceObservedAt).toLocaleString("de-DE")}
          {" · Verfügbarkeit und Endpreis bei eBay prüfen"}
        </p>
        <a href={item.outboundUrl} className="button secondary live-shop-link"
          target="_blank" rel={item.affiliate ? "sponsored nofollow noopener noreferrer" : "noopener noreferrer"}>
          Bei eBay ansehen <Icon name="arrow" />
        </a>
        {item.affiliate && <p className="live-offer-date">Werbelink (Affiliate)</p>}
      </div>
    </article>
  );
}
export function EbayResults({ query }: { query: string }) {
  const [retry, setRetry] = useState(0);
  const [answer, setAnswer] = useState<{ key: string; data?: EbayResponse; failed: boolean } | null>(null);
  const key = query + ":" + retry;
  const valid = query.trim().length >= 2;
  const pending = valid && answer?.key !== key;
  const failed = valid && !pending && answer?.failed;
  const data = valid && !pending && !failed ? answer?.data : undefined;
  useEffect(() => {
    if (!valid) return;
    const controller = new AbortController();
    fetch("/api/ebay/search/?q=" + encodeURIComponent(query), { signal: controller.signal, cache: "no-store" })
      .then(async (reply) => {
        if (!reply.ok) throw new Error("eBay unavailable");
        return validateEbayResponse(await reply.json());
      })
      .then((result) => {
        if (!controller.signal.aborted) setAnswer({ key, data: result, failed: false });
      })
      .catch(() => {
        if (!controller.signal.aborted) setAnswer({ key, failed: true });
      });
    return () => controller.abort();
  }, [query, key, valid]);
  return (
    <>
      <div className="breadcrumb"><Link href="/">Startseite</Link><span>/</span> Entdecken</div>
      <div className="results-heading">
        <span className="eyebrow">ECHTE EBAY-ANGEBOTE · TESTBETRIEB</span>
        <h1>{query ? `Funde für „${query}“` : "Wonach suchst du?"}</h1>
        <p>Diese Angebote stammen direkt aus der eBay-Suche. Ähnliche Produkte sind nicht automatisch identisch oder gleichwertig. Preise und Versand können sich ändern.</p>
      </div>
      <SearchBox compact initialQuery={query} liveCatalog />
      {!valid ? (
        <div className="empty-state live-empty">
          <Icon name="search" /><h2>Was suchst du?</h2>
          <p>Gib oben einen Produktnamen ein, um echte eBay-Angebote zu suchen.</p>
        </div>
      ) : failed ? (
        <div className="empty-state live-empty">
          <Icon name="search" /><h2>eBay-Angebote sind gerade nicht verfügbar.</h2>
          <p>Wir zeigen keine erfundenen Treffer als Ersatz.</p>
          <button className="button secondary" onClick={() => setRetry((n) => n + 1)}>Erneut versuchen</button>
        </div>
      ) : pending ? <p role="status">eBay-Angebote werden geladen …</p> :
        <section aria-label="eBay-Suchergebnisse">
          <p role="status">{data?.items.length ?? 0} echte eBay-Angebote</p>
          {data?.items.length ? (
            <div className="product-grid results-grid">
              {data.items.map((item) => <EbayCard key={item.externalId} item={item} />)}
            </div>
          ) : (
            <div className="empty-state live-empty">
              <Icon name="search" /><h2>Keine passenden Angebote gefunden.</h2>
              <p>Versuche einen anderen Produktnamen.</p>
            </div>
          )}
        </section>
      }
    </>
  );
}
