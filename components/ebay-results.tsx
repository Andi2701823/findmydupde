"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { compareCheaperOffers, cheapestOffer, parseReferencePrice } from "@/lib/ebay-price-comparison";
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
      !Array.isArray(response.items) || response.items.length > 20) throw new Error("Invalid data");
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
function EbayOfferCard({ item, selected, onReference, saving }: {
  item: EbayOffer; selected: boolean; onReference: () => void; saving?: { difference: number; differencePercent: number };
}) {
  const shipping = Number(item.shippingCost?.value);
  const shippingKnown = item.shippingCost?.value !== undefined &&
    Number.isFinite(shipping) && shipping >= 0 && item.shippingCost.currency === item.currency;
  return <article className="affiliate-card" data-ebay-offer={item.externalId}>
    <div className="affiliate-image">
      <Image src={item.imageUrl} width={320} height={250} alt={item.title} unoptimized loading="lazy" />
    </div>
    <div className="affiliate-body">
      <span className="affiliate-category">eBay {item.condition ? "· " + item.condition : ""}</span>
      <h3>{item.title}</h3>
      {saving && <p className="ebay-saving">Artikelpreis {money(saving.difference, item.currency)} niedriger ({saving.differencePercent} %)</p>}
      <div className="affiliate-price">
        <strong>{money(item.price, item.currency)}</strong>
        <small>Artikelpreis, ohne Versand</small>
        <small>{shippingKnown ? "Versand laut Angebot: " + money(shipping, item.currency) : "Versandkosten bei eBay prüfen"}</small>
        {shippingKnown && <small>Artikel + angegebener Versand: {money(item.price + shipping, item.currency)}</small>}
        <small>Preis abgerufen: {new Date(item.priceObservedAt).toLocaleString("de-DE")}</small>
      </div>
      <button type="button" onClick={onReference} className="button secondary ebay-reference-button"
        aria-pressed={selected}>
        {selected ? "Als Vergleichsbasis ausgewählt" : "Als Preisreferenz wählen"}
      </button>
      <a href={item.outboundUrl} target="_blank" className="button secondary affiliate-shop-link"
        rel={item.affiliate ? "sponsored nofollow noopener noreferrer" : "noopener noreferrer"}>
        Bei eBay ansehen <Icon name="arrow" />
      </a>
      {item.affiliate && <p className="affiliate-disclosure">Werbelink (Affiliate)</p>}
    </div>
  </article>;
}
export function EbayResults({ query }: { query: string }) {
  const [retry, setRetry] = useState(0);
  const [state, setState] = useState<{ key: string; data?: EbayResponse; error: boolean } | null>(null);
  const [referenceId, setReferenceId] = useState<string | null>(null);
  const [typedPrice, setTypedPrice] = useState("");
  const [sameCondition, setSameCondition] = useState(false);
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
  const data = !loading && !state?.error ? state?.data : undefined;
  const offers = data?.items ?? [];
  const selected = offers.find(offer => offer.externalId === referenceId);
  const currency: "EUR" | "USD" = data?.marketplace === "EBAY_US" ? "USD" : "EUR";
  const manualAmount = parseReferencePrice(typedPrice);
  const reference = selected
    ? { price: selected.price, currency: selected.currency, externalId: selected.externalId, condition: selected.condition }
    : manualAmount !== null ? { price: manualAmount, currency } : null;
  const compared = reference ? compareCheaperOffers(offers, reference, Boolean(selected && sameCondition)) : [];
  const cheapest = cheapestOffer(offers.filter(item => item.currency === currency));
  const showComparison = reference !== null;
  const displayed = showComparison ? compared.map(row => row.offer) : offers;
  function pickReference(offer: EbayOffer) {
    setReferenceId(offer.externalId);
    setTypedPrice("");
    setSameCondition(false);
  }
  function clearReference() {
    setReferenceId(null);
    setTypedPrice("");
    setSameCondition(false);
  }
  return <section className="search-products ebay-section" aria-label="eBay-Suchergebnisse">
    <div className="section-heading"><div>
      <span className="eyebrow">AKTUELLE EBAY-ANGEBOTE</span>
      <h2>Produkte auf eBay vergleichen</h2>
      <p>Reale eBay-Suchtreffer. Günstiger bedeutet hier nur einen niedrigeren Artikelpreis, nicht identische Qualität, Größe oder Ausstattung.</p>
    </div></div>
    {loading ? <p role="status">eBay-Angebote werden geladen …</p> :
      state?.error ? <div className="empty-state"><Icon name="search" />
        <h2>eBay-Angebote sind gerade nicht verfügbar.</h2>
        <p>Unsere bestehenden Händlerprodukte und Ratgeber bleiben verfügbar.</p>
        <button className="button secondary" onClick={() => setRetry(n => n + 1)}>Erneut versuchen</button>
      </div> : offers.length === 0 ? <p role="status">Keine eBay-Angebote für diesen Begriff.</p> :
      <>
        <div className="ebay-comparison-panel">
          <h3>Preisvergleich für „{query}“</h3>
          <p>Wähle unten ein Angebot als Ausgangsprodukt oder gib den bekannten Preis deines Wunschprodukts ein.</p>
          <div className="ebay-compare-controls">
            <label htmlFor="ebay-original-price">Originalpreis ({currency}, nur Artikel)</label>
            <input id="ebay-original-price" type="text" inputMode="decimal" autoComplete="off"
              value={selected ? money(selected.price, selected.currency) : typedPrice}
              readOnly={Boolean(selected)} placeholder="z. B. 89,99"
              onChange={event => { setTypedPrice(event.target.value.slice(0, 20)); setReferenceId(null); }}
              aria-describedby="ebay-price-explanation" />
            {showComparison && <button type="button" className="button secondary" onClick={clearReference}>Vergleich zurücksetzen</button>}
          </div>
          {selected && <p className="ebay-selected">Vergleichsbasis: {selected.title}</p>}
          {selected?.condition && <label className="ebay-condition-filter">
            <input type="checkbox" checked={sameCondition} onChange={event => setSameCondition(event.target.checked)} />
            Nur Angebote mit demselben angegebenen Zustand
          </label>}
          <p id="ebay-price-explanation" className="ebay-disclaimer">Verglichen werden nur Artikelpreise in derselben Währung. Versandkosten und mögliche weitere Kosten sind nicht in der Differenz enthalten. Die Suchtreffer sind nicht auf Gleichwertigkeit geprüft.</p>
          {showComparison ? <p className="ebay-comparison-summary" role="status">
            <strong>{compared.length}</strong> günstigere Suchtreffer von {offers.length} angezeigten Angeboten
          </p> : cheapest ? <p className="ebay-comparison-summary" role="status">
            Niedrigster Artikelpreis unter diesen {offers.length} Treffern: <strong>{money(cheapest.price, cheapest.currency)}</strong>. Wähle eine Vergleichsbasis, um Preisunterschiede zu sehen.
          </p> : null}
          {!selected && typedPrice.trim() && manualAmount === null && <p role="alert" className="error-message">Bitte einen gültigen positiven Betrag eingeben, z. B. 89,99.</p>}
        </div>
        {showComparison && compared.length === 0 && <div className="empty-state">
          <Icon name="search" />
          <h3>Keine günstigeren Treffer in dieser Auswahl.</h3>
          <p>Das heißt nicht, dass es auf eBay keine günstigeren Produkte gibt. Versuche einen genaueren Suchbegriff oder setze den Vergleich zurück.</p>
        </div>}
        <div className="affiliate-grid">
          {displayed.map(item => {
            const matched = showComparison ? compared.find(row => row.offer.externalId === item.externalId) : undefined;
            return <EbayOfferCard key={item.externalId} item={item} selected={selected?.externalId === item.externalId}
              onReference={() => pickReference(item)}
              saving={matched ? { difference: matched.difference, differencePercent: matched.differencePercent } : undefined} />;
          })}
        </div>
        <p className="ebay-disclaimer">Angezeigt werden maximal 20 Treffer aus dieser eBay-Abfrage, keine vollständige Marktübersicht. Verfügbarkeit, Versand und Endpreis bitte direkt bei eBay prüfen.</p>
      </>}
  </section>;
}
