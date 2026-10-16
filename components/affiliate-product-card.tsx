"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { AffiliateProduct } from "@/lib/affiliate-products";
import { affiliateFeedImported, affiliateProductPath, formatFeedPrice } from "@/lib/affiliate-products";
import { Icon } from "./icon";
export function AffiliateProductCard({product}:{product:AffiliateProduct}) {
  const [brokenImage,setBrokenImage] = useState(false);
  return <article className="affiliate-card">
    <div className="affiliate-image">
      {brokenImage ? <div className="image-fallback"><Icon name="image" /><span>Produktbild beim Händler ansehen</span></div>
        : <Image src={product.image} alt={product.name} width={340} height={340} unoptimized referrerPolicy="no-referrer"
          loading="lazy" onError={()=>setBrokenImage(true)} />}
    </div>
    <div className="affiliate-body">
      <span className="affiliate-category">{product.category} · {product.merchant}</span>
      <h3><Link href={affiliateProductPath(product)}>{product.name}</Link></h3>
      <Link href={affiliateProductPath(product)} className="affiliate-details-link">Beschreibung & Details ansehen <Icon name="arrow" /></Link>
      <div className="affiliate-price">
        <strong>{formatFeedPrice(product.priceCents)}</strong>
        <small>Feedpreis vom {affiliateFeedImported} · Preis im Shop prüfen</small>
      </div>
      <a href={product.affiliateUrl} target="_blank" rel="nofollow sponsored noopener noreferrer"
        className="button primary affiliate-shop-link" aria-label={`${product.name} beim Händler ansehen (Werbelink, neuer Tab)`}>
        Zum Händler* <Icon name="arrow" />
      </a>
      <p className="affiliate-disclosure">* Affiliate-Link: Bei einem Kauf können wir eine Provision erhalten. Für dich entstehen keine zusätzlichen Kosten.</p>
    </div>
  </article>;
}
