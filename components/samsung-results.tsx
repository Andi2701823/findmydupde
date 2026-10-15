"use client";
import {useEffect,useState} from "react";
import Link from "next/link";
import type {SamsungProduct} from "@/lib/samsung-catalog";
import {SamsungProductCard} from "./samsung-product-card";
import {Icon} from "./icon";
type Response={products:SamsungProduct[];total:number};
export function SamsungResults({query}:{query:string}) {
  const [items,setItems]=useState<SamsungProduct[]>([]);
  const [count,setCount]=useState(0);
  const [loading,setLoading]=useState(true);
  const [failed,setFailed]=useState(false);
  useEffect(()=>{
    const controller=new AbortController();
    fetch("/api/samsung/search/?q="+encodeURIComponent(query),{signal:controller.signal})
      .then(async r=>{if(!r.ok)throw new Error("search failed");return await r.json() as Response;})
      .then(data=>{if(!controller.signal.aborted){setItems(data.products);setCount(data.total);setLoading(false);}})
      .catch(()=>{if(!controller.signal.aborted){setLoading(false);setFailed(true);}});
    return ()=>controller.abort();
  },[query]);
  return <section className="search-products samsung-search-results" aria-label="Samsung Shop DE Angebote">
    <div className="section-heading"><div><span className="eyebrow">SAMSUNG SHOP DE · AWIN</span>
      <h2>Samsung-Angebote {loading?"werden geladen":count?`(${count})`:""}</h2>
      <p>Artikelpreise aus dem Feed, keine live geprüften Gesamtpreise. Händlerlinks sind Werbung.</p></div>
      <Link href={"/samsung/?q="+encodeURIComponent(query)} className="text-link">Im Samsung-Katalog suchen <Icon name="arrow"/></Link>
    </div>
    {loading&&<p role="status">Samsung-Angebote werden geladen …</p>}
    {failed&&<p role="status">Samsung-Angebote sind momentan nicht verfügbar.</p>}
    {!loading&&!failed&&items.length===0&&<p>Keine Samsung-Produkte zu diesem Suchbegriff gefunden.</p>}
    {items.length>0&&<div className="affiliate-grid">{items.map(p=><SamsungProductCard key={p.aw_product_id} product={p}/>)}</div>}
  </section>;
}
