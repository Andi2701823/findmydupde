"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { SearchBox } from "./search-box";
import { Icon } from "./icon";

type Sort = "recent" | "price-asc" | "price-desc";
export interface LiveOffer {
  source: "awin";
  productId: string;
  offerId: string;
  title: string;
  description: string;
  category: string;
  retailer: { id: string; name: string };
  imageUrl: string | null;
  price: { amountMinor: number; currency: "EUR"; observedAt: string };
  availability: "in_stock" | "unknown";
  affiliateUrl: string | null;
}
interface LiveCatalogResponse {
  source: "catalog";
  offers: LiveOffer[];
  page: number;
  pageSize: number;
  hasMore: boolean;
}

function safeHttpsUrl(raw: string | null) {
  if (!raw) return null;
  try {
    const url = new URL(raw);
    return url.protocol === "https:" && !url.username && !url.password && !url.port
      ? url.href : null;
  } catch {
    return null;
  }
}

export function validateLiveCatalog(data: unknown): LiveCatalogResponse {
  if (!data || typeof data !== "object" || Array.isArray(data)) throw new Error("invalid catalog");
  const value = data as Partial<LiveCatalogResponse>;
  if (value.source !== "catalog" || !Array.isArray(value.offers) ||
      value.offers.length > 24 || !Number.isInteger(value.page) ||
      !Number.isInteger(value.pageSize) || typeof value.hasMore !== "boolean") {
    throw new Error("invalid catalog");
  }
  for (const offer of value.offers) {
    if (!offer || offer.source !== "awin" ||
        !offer.offerId || !offer.title || !offer.retailer?.name ||
        !Number.isSafeInteger(offer.price?.amountMinor) || offer.price!.amountMinor < 0 ||
        offer.price?.currency !== "EUR" || !Number.isFinite(Date.parse(offer.price?.observedAt ?? "")) ||
        (offer.affiliateUrl !== null && !safeHttpsUrl(offer.affiliateUrl)) ||
        (offer.imageUrl !== null && !safeHttpsUrl(offer.imageUrl))) {
      throw new Error("invalid offer");
    }
  }
  return value as LiveCatalogResponse;
}

const currency = new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" });

function LiveCard({ offer }: { offer: LiveOffer }) {
  const image = safeHttpsUrl(offer.imageUrl);
  const shop = safeHttpsUrl(offer.affiliateUrl);
  return (
    <article className="product-card live-offer-card">
      <div className="product-art live-product-art">
        {image ? (
          <Image src={image} unoptimized width={420} height={420}
            alt={offer.title} loading="lazy" />
        ) : (
          <div className="live-image-placeholder">Kein Produktbild vorhanden</div>
        )}
      </div>
      <div className="product-meta">
        <span>{offer.category} <span aria-hidden="true">/</span> {offer.retailer.name}</span>
        <h3>{offer.title}</h3>
        <div className="price-row">
          <strong>{currency.format(offer.price.amountMinor / 100)}</strong>
          <span>Händlerpreis</span>
        </div>
        <p className="live-offer-date">
          Preisstand: {new Date(offer.price.observedAt).toLocaleDateString("de-DE")}
          {offer.availability === "in_stock" ? " · Laut Händler verfügbar" : " · Verfügbarkeit unbestätigt"}
        </p>
        {shop ? (
          <a href={shop} className="button secondary live-shop-link"
            target="_blank" rel="sponsored nofollow noopener noreferrer">
            Angebot beim Händler <Icon name="arrow" />
          </a>
        ) : <p className="live-offer-date">Kein geprüfter Shop-Link vorhanden.</p>}
      </div>
    </article>
  );
}

export function LiveResults({ query }: { query: string }) {
  const [sort, setSort] = useState<Sort>("recent");
  const [maxPrice, setMaxPrice] = useState("");
  const [page, setPage] = useState(1);
  const [retry, setRetry] = useState(0);
  const [answer, setAnswer] = useState<{
    key: string; data?: LiveCatalogResponse; failed: boolean;
  } | null>(null);
  const key = [query, sort, maxPrice, page, retry].join("|");
  const validQuery = query.trim().length >= 2;
  const pending = validQuery && answer?.key !== key;
  const failed = validQuery && !pending && answer?.failed;
  const data = !pending && !failed ? answer?.data : undefined;

  useEffect(() => {
    if (!validQuery) return;
    const controller = new AbortController();
    const params = new URLSearchParams({ q: query, sort, page: String(page) });
    if (maxPrice) params.set("maxPrice", maxPrice);
    fetch("/api/products/search/?" + params.toString(), {
      signal: controller.signal, cache: "no-store",
    })
      .then(async (response) => {
        if (!response.ok) throw new Error("catalog unavailable");
        return validateLiveCatalog(await response.json());
      })
      .then((body) => {
        if (!controller.signal.aborted) setAnswer({ key, data: body, failed: false });
      })
      .catch(() => {
        if (!controller.signal.aborted) setAnswer({ key, failed: true });
      });
    return () => controller.abort();
  }, [validQuery, query, sort, page, maxPrice, key]);

  return (
    <>
      <div className="breadcrumb">
        <Link href="/">Startseite</Link><span>/</span> Entdecken
      </div>
      <div className="results-heading">
        <span className="eyebrow">ECHTE HÄNDLERANGEBOTE</span>
        <h1>{query ? `Funde für „${query}“` : "Finde dein nächstes Lieblingsstück."}</h1>
        <p>Hier findest du echte Katalogangebote, sobald Partnerprodukte eingespielt sind.
          Preise und Verfügbarkeit können sich beim Händler ändern.</p>
      </div>
      <SearchBox compact initialQuery={query} liveCatalog />
      {!validQuery ? (
        <div className="empty-state live-empty">
          <Icon name="search" />
          <h2>Was suchst du?</h2>
          <p>Gib oben einen Produktnamen ein. Die Textsuche verwendet unseren echten Produktkatalog.</p>
        </div>
      ) : (
        <>
          <div className="results-toolbar live-toolbar">
            <span role="status" aria-live="polite">
              {pending ? "Echte Angebote werden geladen …" :
                failed ? "Suche vorübergehend nicht verfügbar" :
                `${data?.offers.length ?? 0} Händlerangebote auf Seite ${page}`}
            </span>
            <div>
              <label htmlFor="live-max-price">Maximalpreis</label>
              <select id="live-max-price" value={maxPrice}
                onChange={(e) => { setMaxPrice(e.target.value); setPage(1); }}>
                <option value="">Jeder Preis</option>
                <option value="25">Bis 25 €</option>
                <option value="50">Bis 50 €</option>
                <option value="100">Bis 100 €</option>
                <option value="200">Bis 200 €</option>
              </select>
              <label htmlFor="live-sort">Sortieren</label>
              <select id="live-sort" value={sort}
                onChange={(e) => { setSort(e.target.value as Sort); setPage(1); }}>
                <option value="recent">Aktuelle Angebote</option>
                <option value="price-asc">Preis aufsteigend</option>
                <option value="price-desc">Preis absteigend</option>
              </select>
            </div>
          </div>
          {failed ? (
            <div className="empty-state live-empty">
              <Icon name="search" />
              <h2>Die Produktsuche ist gerade nicht verfügbar.</h2>
              <p>Bitte versuche es später erneut. Wir zeigen dir keine erfundenen Ergebnisse als Ersatz.</p>
              <button className="button secondary" onClick={() => setRetry((n) => n + 1)}>
                Erneut versuchen
              </button>
            </div>
          ) : pending ? <p role="status">Suche läuft …</p> :
            data?.offers.length ? (
              <>
                <div className="product-grid results-grid">
                  {data.offers.map((offer) => <LiveCard key={offer.offerId} offer={offer} />)}
                </div>
                <nav className="live-pagination" aria-label="Ergebnisseiten">
                  <button className="button secondary" disabled={page === 1}
                    onClick={() => setPage((n) => Math.max(1, n - 1))}>Zurück</button>
                  <span>Seite {page}</span>
                  <button className="button secondary" disabled={!data.hasMore}
                    onClick={() => setPage((n) => Math.min(50, n + 1))}>Weitere Angebote</button>
                </nav>
              </>
            ) : (
              <div className="empty-state live-empty">
                <Icon name="search" />
                <h2>Noch keine passenden Händlerangebote.</h2>
                <p>Unser echter Produktkatalog wird gerade aufgebaut.
                  Für diese Suche sind noch keine bestätigten Angebote vorhanden.</p>
              </div>
            )}
        </>
      )}
    </>
  );
}
