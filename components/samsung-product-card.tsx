"use client";
import Image from "next/image";
import {useState} from "react";
import type {SamsungProduct} from "@/lib/samsung-catalog";
import {formatSamsungPrice} from "@/lib/samsung-prices";
import {Icon} from "./icon";
export function SamsungProductCard({product}:{product:SamsungProduct}) {
  const [broken,setBroken]=useState(false);
  return <article className="affiliate-card">
    <div className="affiliate-image">
      {broken?<div className="image-fallback"><Icon name="image"/><span>Bild beim Händler ansehen</span></div>:
        <Image src={product.image_url} alt={product.product_name} width={340} height={340} unoptimized loading="lazy" onError={()=>setBroken(true)}/>}
    </div>
    <div className="affiliate-body">
      <span className="affiliate-category">{product.category} · Samsung Shop DE</span>
      <h3>{product.product_name}</h3>
      <div className="affiliate-price"><strong>{formatSamsungPrice(product.price_cents)}</strong>
        <small>Artikelpreis laut Awin-Feed, nicht live</small>
        {product.delivery_cents!==null&&<small>Versand laut Feed: {formatSamsungPrice(product.delivery_cents)}</small>}
      </div>
      <a href={product.affiliate_url} className="button primary affiliate-shop-link" target="_blank"
        rel="nofollow sponsored noopener noreferrer" aria-label={`${product.product_name} im Samsung Shop ansehen (Werbelink)`}>
        Zum Samsung Shop <Icon name="arrow"/>
      </a>
      <p className="affiliate-disclosure">Werbelink · Händlerpreise und Versandbedingungen vor dem Kauf prüfen.</p>
    </div>
  </article>;
}
