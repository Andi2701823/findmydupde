import Image from "next/image";
import {euro} from "@/lib/joybuy-catalog-helpers";
import type {JoybuyProduct} from "@/lib/joybuy-catalog";
export function JoybuyProductCard({product}:{product:JoybuyProduct}){
  const hasOlderListPrice=product.original_price_cents>product.price_cents;
  return <article className="affiliate-card">
    <div className="affiliate-image"><Image src={product.image_url} alt={product.product_name} width={320} height={250} loading="lazy" unoptimized/></div>
    <div className="affiliate-body">
      <span className="affiliate-category">{product.category}{product.brand?" · "+product.brand:""}</span>
      <h3>{product.product_name}</h3>
      <div className="affiliate-price">
        <strong>{euro(product.price_cents)}</strong>
        {hasOlderListPrice&&<small>Vorher laut Feed: {euro(product.original_price_cents)}</small>}
        <small>{product.shipping_cents===0?"Versandkostenfrei laut Feed":`zzgl. ${euro(product.shipping_cents)} Versand laut Feed`}</small>
        <small>Feedpreis, nicht live geprüft</small>
      </div>
      <a href={product.affiliate_url} className="button secondary affiliate-shop-link" target="_blank" rel="sponsored nofollow noopener noreferrer">Bei JoyBuy ansehen →</a>
      <p className="affiliate-disclosure">Werbelink (Affiliate)</p>
    </div>
  </article>;
}
