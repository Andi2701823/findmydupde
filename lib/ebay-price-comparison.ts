/** Price comparison of genuine search results, not an identity or equivalence claim. */
export type EbayComparableOffer = {
  externalId: string;
  price: number;
  currency: "EUR" | "USD";
  condition: string | null;
};
export type ComparisonReference = {
  price: number;
  currency: "EUR" | "USD";
  externalId?: string;
  condition?: string | null;
};
export type CheaperOffer<T extends EbayComparableOffer> = {
  offer: T;
  difference: number;
  differencePercent: number;
};

function cents(amount: number): number | null {
  if (!Number.isFinite(amount) || amount < 0 || amount > 1_000_000) return null;
  const value = Math.round(amount * 100);
  return Number.isSafeInteger(value) ? value : null;
}

/** Only simple German/English decimal entry; reject separators that look like thousands. */
export function parseReferencePrice(value: string): number | null {
  const normalized = value.trim();
  if (!/^\d{1,7}(?:[,.]\d{1,2})?$/.test(normalized)) return null;
  const numeric = Number(normalized.replace(",", "."));
  const priceCents = cents(numeric);
  return priceCents !== null && priceCents > 0 ? priceCents / 100 : null;
}

export function compareCheaperOffers<T extends EbayComparableOffer>(
  offers: readonly T[],
  reference: ComparisonReference,
  sameCondition = false,
): CheaperOffer<T>[] {
  const priceCents = cents(reference.price);
  if (priceCents === null || priceCents <= 0) return [];
  return offers.flatMap((offer) => {
    const offerCents = cents(offer.price);
    if (offerCents === null || offer.currency !== reference.currency ||
        offerCents >= priceCents || offer.externalId === reference.externalId ||
        (sameCondition && reference.condition != null &&
          offer.condition?.trim().toLocaleLowerCase("de-DE") !==
            reference.condition.trim().toLocaleLowerCase("de-DE"))) return [];
    const differenceCents = priceCents - offerCents;
    return [{
      offer,
      difference: differenceCents / 100,
      differencePercent: Math.round(differenceCents / priceCents * 100),
    }];
  }).sort((a, b) => a.offer.price - b.offer.price ||
    a.offer.externalId.localeCompare(b.offer.externalId));
}

export function cheapestOffer<T extends EbayComparableOffer>(offers: readonly T[]): T | null {
  return offers.filter((offer) => cents(offer.price) !== null)
    .reduce<T | null>((lowest, offer) =>
      lowest === null || offer.price < lowest.price ? offer : lowest, null);
}
