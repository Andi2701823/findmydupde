import Image from "next/image";
import type {MactradeProduct} from "@/lib/mactrade-catalog";
import {mactradeEuros} from "@/lib/mactrade-catalog";

export function MactradeProductCard({product}:{product:MactradeProduct}) {
  return <article className="affiliate-card mactrade-card">
    <div className="affiliate-image">
      <Image src={product.image_url} alt={product.product_name} width={340} height={340} unoptimized loading="lazy" />
    </div>
    <div className="affiliate-body">
      <span className="affiliate-category">{product.category} · MacTrade</span>
      <h3 title={product.product_name}>{product.product_name}</h3>
      <div className="affiliate-price">
        <strong>{mactradeEuros(product.price_cents)}</strong>
        <small>Artikelpreis laut Händlerfeed · Versand {mactradeEuros(product.delivery_cents)}</small>
      </div>
      <a href={product.affiliate_url} className="button secondary affiliate-shop-link"
        target="_blank" rel="sponsored nofollow noopener noreferrer"
        aria-label={product.product_name+" bei MacTrade ansehen (Werbelink)"}>
        Bei MacTrade ansehen →
      </a>
      <p className="affiliate-disclosure">Werbelink · Preis und Lieferzeit im Shop prüfen</p>
    </div>
  </article>;
}
