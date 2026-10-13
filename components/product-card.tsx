"use client";
import Image from "next/image";
import { useRef } from "react";
import type { Product } from "@/lib/types";
import { euro } from "@/lib/search";
import { useFavorites } from "./favorites";
import { Icon } from "./icon";
export function ProductCard({ product }: { product: Product }) {
  const { ids, toggle } = useFavorites();
  const saved = ids.includes(product.id);
  const dialog = useRef<HTMLDialogElement>(null);
  return (
    <article className="product-card">
      <div className={`product-art art-${product.category}`}>
        <button
          className="product-open"
          onClick={() => dialog.current?.showModal()}
          aria-label={`${product.title}, Demodetails ansehen`}
        >
          <Image
            src={product.image}
            alt={`Illustration: ${product.title}`}
            width={420}
            height={420}
          />
        </button>
        <span className="product-demo">DEMO</span>
        <button
          className={`favorite-button ${saved ? "is-saved" : ""}`}
          aria-label={`${product.title} ${saved ? "aus Merkliste entfernen" : "merken"}`}
          aria-pressed={saved}
          onClick={() => toggle(product.id)}
        >
          <Icon name="heart" />
        </button>
      </div>
      <div className="product-meta">
        <span>
          {product.category} <span aria-hidden="true">/</span> Demo-Katalog
        </span>
        <h3>
          <button onClick={() => dialog.current?.showModal()}>
            {product.title}
          </button>
        </h3>
        <div className="price-row">
          <strong>{euro(product.demoPrice)}</strong>
          <span>Beispielpreis</span>
          <button
            className="round-arrow"
            aria-label={`Details zu ${product.title}`}
            onClick={() => dialog.current?.showModal()}
          >
            <Icon name="arrow" />
          </button>
        </div>
        <p className="fiction-note">Erfundenes Produkt · kein Shop-Angebot</p>
      </div>
      <dialog
        ref={dialog}
        className="product-dialog"
        aria-labelledby={`title-${product.id}`}
        onClick={(e) => {
          if (e.target === e.currentTarget) dialog.current?.close();
        }}
      >
        <button
          className="dialog-close icon-button"
          aria-label="Details schließen"
          onClick={() => dialog.current?.close()}
        >
          <Icon name="close" />
        </button>
        <div className="dialog-art">
          <Image
            src={product.image}
            alt={`Illustration: ${product.title}`}
            width={360}
            height={360}
          />
        </div>
        <div className="dialog-body">
          <span className="demo-pill">Fiktives Demoprodukt</span>
          <h2 id={`title-${product.id}`}>{product.title}</h2>
          <p>{product.description}</p>
          <dl className="product-attributes">
            <div>
              <dt>Farbe</dt>
              <dd>{product.color}</dd>
            </div>
            <div>
              <dt>Material (Demo)</dt>
              <dd>{product.material}</dd>
            </div>
            <div>
              <dt>Beispielpreis</dt>
              <dd>{euro(product.demoPrice)}</dd>
            </div>
            <div>
              <dt>Fiktiver Vergleichspreis</dt>
              <dd>{euro(product.demoReferencePrice)}</dd>
            </div>
          </dl>
          <p className="notice">
            Beide Preise sind reine Rechenbeispiele. Es gibt keinen Händler,
            keine geprüfte Ersparnis und keinen Kauf-Link.
          </p>
          <button className="button primary" onClick={() => toggle(product.id)}>
            <Icon name="heart" />
            {saved ? "Aus Merkliste entfernen" : "Auf die Merkliste"}
          </button>
        </div>
      </dialog>
    </article>
  );
}
