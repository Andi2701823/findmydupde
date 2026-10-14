"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Icon } from "./icon";

type EbayOffer = {
  source: "ebay";
  externalId: string; title: string; imageUrl: string; price: number;
  currency: "EUR" | "USD"; retailer: "eBay"; outboundUrl: string;
  affiliate: boolean; condition: string | null; seller: string | null;
  shippingCost: { value?: string; currency?: string } | null; priceObservedAt: string;
};
type EbayResponse = { source: "ebay"; marketplace: "EBAY_DE" | "EBAY_US"; items: EbayOffer[] };
function trusted(value: unknown, host: string): boolean {
  if (typeof value !== "string") return false;
  try {
    const u = new URL(value);
    return u.protocol === "https:" && !u.username && !u.password && !u.port &&
      (u.hostname === host || u.hostname.endsWith("." + host));
  } catch { return false; }
}
export function validateEbayResponse(input: unknown): EbayResponse {
  if (!input || typeof input !== "object" || Array.isArray(input)) throw new Error("Invalid data");
  const response = input as Partial<EbayResponse>;
  if (response.source !== "ebay" || !["EBAY_DE", "EBAY_US"].includes(response.marketplace ?? "") ||
      !Array.isArray(response.items) || response.items.length > 10) throw new Error("Invalid data");
  for (const item of response.items) {
    if (!item || item.source !== "ebay" || typeof item.externalId !== "string" ||
        !item.externalId || typeof item.title !== "string" || !item.title ||
        !Number.isFinite(item.price) || item.price < 0 ||
        !["EUR", "USD"].includes(item.currency) || item.retailer !== "eBay" ||
        typeof item.affiliate !== "boolean" ||
        !(trusted(item.outboundUrl, "ebay.de") || trusted(item.outboundUrl, "ebay.com")) ||
        !trusted(item.imageUrl, "i.ebayimg.com") ||
        !Number.isFinite(Date.parse(item.priceObservedAt)) ||
        (item.condition !== null && typeof item.condition !== "string") ||
        (item.seller !== null && typeof item.seller !== "string")) throw new Error("Invalid item");
  }
  return response as EbayResponse;
}
function money(value: number, currency: "EUR" | "USD") {
  return new Intl.NumberFormat("de-DE", { style: "currency", currency }).format(value);
}
export function EbayResults({ query }: { query: string }) {
  const [retry, setRetry] = useState(0);
  const [state, setState] = useState<{ key: string; data?: EbayResponse; error: boolean } | null>(null);
  const key = query + ":" + retry;
  const loading = state?.key !== key;
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/ebay/search/?q=" + encodeURIComponent(query), { signal: controller.signal, cache: "no-store" })
      .then(async response => {
        if (!response.ok) throw new Error("Not available");
        return validateEbayResponse(await response.json());
      })
      .then(data => { if (!controller.signal.aborted) setState({ key, data, error: false }); })
      .catch(() => { if (!controller.signal.aborted) setState({ key, error: true }); });
    return () => controller.abort();
  }, [key, query]);
  const offers = !loading && !state?.error ? state?.data?.items ?? [] : [];
  return <section className="search-products" aria-label="eBay-Suchergebnisse">
    <div className="section-heading"><div>
      <span className="eyebrow">AKTUELLE EBAY-ANGEBOTE</span>
      <h2>Produkte auf eBay</h2>
      <p>Echte eBay-Suchtreffer. Keine geprüften günstigeren oder identischen Alternativen. Preise und Versand können sich ändern.</p>
    </div></div>
    {loading ? <p role="status">eBay-Angebote werden geladen …</p> :
      state?.error ? <div className="empty-state"><Icon name="search" />
        <h2>eBay-Angebote sind gerade nicht verfügbar.</h2>
        <p>Unsere bestehenden Händlerprodukte und Ratgeber bleiben verfügbar.</p>
        <button className="button secondary" onClick={() => setRetry(n => n + 1)}>Erneut versuchen</button>
      </div> : offers.length === 0 ? <p role="status">Keine eBay-Angebote für diesen Begriff.</p> :
      <><p role="status" className="affiliate-result-count">{offers.length} eBay-Angebote</p>
        <div className="affiliate-grid">{offers.map(item => {
          const shipping = Number(item.shippingCost?.value);
          const shippingKnown = item.shippingCost?.value !== undefined &&
            Number.isFinite(shipping) && item.shippingCost.currency === item.currency;
          return <article className="affiliate-card" key={item.externalId}>
            <div className="affiliate-image">
              <Image src={item.imageUrl} width={320} height={250} alt={item.title} unoptimized loading="lazy" />
            </div>
            <div className="affiliate-body">
              <span className="affiliate-category">eBay {item.condition ? "· " + item.condition : ""}</span>
              <h3>{item.title}</h3>
              <div className="affiliate-price">
                <strong>{money(item.price, item.currency)}</strong>
                <small>{shippingKnown ? "Versand: " + money(shipping, item.currency) : "Versandkosten beim Händler prüfen"}</small>
                <small>Preis abgerufen: {new Date(item.priceObservedAt).toLocaleString("de-DE")}</small>
              </div>
              <a href={item.outboundUrl} target="_blank" className="button secondary affiliate-shop-link"
                rel={item.affiliate ? "sponsored nofollow noopener noreferrer" : "noopener noreferrer"}>
                Bei eBay ansehen <Icon name="arrow" />
              </a>
              {item.affiliate && <p className="affiliate-disclosure">Werbelink (Affiliate)</p>}
            </div>
          </article>;
        })}</div></>
    }
  </section>;
}
