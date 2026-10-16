"use client";
import {useState} from "react";
import Image from "next/image";
import {Icon} from "./icon";
import {anthbotFeedSnapshot,formatAnthbotPrice,type AnthbotProduct} from "@/lib/anthbot-products";

export function AnthbotProductCard({product}:{product:AnthbotProduct}) {
 const [broken,setBroken]=useState(false);
 return <article className="affiliate-card" data-anthbot-variant={product.id}>
  <div className="affiliate-image">
   {broken?<div className="image-fallback"><Icon name="image"/><span>Produktbild beim Händler ansehen</span></div>:
    <Image src={product.image} alt={product.name} width={340} height={340}
      unoptimized loading="lazy" onError={()=>setBroken(true)}/>}
  </div>
  <div className="affiliate-body">
   <span className="affiliate-category">{product.category} · ANTHBOT DE</span>
   <h3>{product.name}</h3>
   <div className="affiliate-price">
    <strong>{formatAnthbotPrice(product.priceCents)}</strong>
    <small>Artikelpreis laut Awin-Feed vom {anthbotFeedSnapshot}, nicht live</small>
    <small>Verfügbarkeit, Lieferumfang und Versand beim Händler prüfen</small>
   </div>
   <a href={product.affiliateUrl} target="_blank" className="button primary affiliate-shop-link"
     rel="sponsored nofollow noopener noreferrer" aria-label={product.name+" bei ANTHBOT ansehen (Werbelink)"}>
    Zum ANTHBOT-Shop <Icon name="arrow"/>
   </a>
   <p className="affiliate-disclosure">Werbelink · Bei einem Kauf können wir eine Provision erhalten.</p>
  </div>
 </article>;
}
