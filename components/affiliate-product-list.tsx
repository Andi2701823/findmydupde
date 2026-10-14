"use client";
import { useMemo,useState } from "react";
import { affiliateProducts,findAffiliateProducts,affiliateFeedImported } from "@/lib/affiliate-products";
import { AffiliateProductCard } from "./affiliate-product-card";
const categories=["Alle","Gesichtspflege","Masken & Peelings","Sets & Kuren","Sonnenschutz"] as const;
export function AffiliateProductList(){
  const [query,setQuery]=useState("");
  const [category,setCategory]=useState<string>("Alle");
  const [sort,setSort]=useState("name");
  const visible=useMemo(()=>{
    const result=findAffiliateProducts(query,category==="Alle"?undefined:category);
    return [...result].sort((a,b)=>sort==="asc"?a.priceCents-b.priceCents:sort==="desc"?b.priceCents-a.priceCents:a.name.localeCompare(b.name,"de"));
  },[query,category,sort]);
  return <>
    <div className="affiliate-controls">
      <label>Produkte suchen
        <input type="search" maxLength={120} placeholder="z. B. Serum, Maske, Hyaluron" value={query} onChange={e=>setQuery(e.target.value)} />
      </label>
      <label>Kategorie
        <select value={category} onChange={e=>setCategory(e.target.value)}>{categories.map(c=><option key={c} value={c}>{c}</option>)}</select>
      </label>
      <label>Sortieren
        <select value={sort} onChange={e=>setSort(e.target.value)}>
          <option value="name">Produktname</option>
          <option value="asc">Feedpreis: aufsteigend</option>
          <option value="desc">Feedpreis: absteigend</option>
        </select>
      </label>
    </div>
    <p className="affiliate-result-count" role="status">{visible.length} von {affiliateProducts.length} Produkten</p>
    {visible.length ? <div className="affiliate-grid">{visible.map(p=><AffiliateProductCard key={p.id} product={p}/>)}</div>
      : <p className="empty-state">Für diese Auswahl wurden keine Produkte gefunden. Bitte ändere den Suchbegriff oder die Kategorie.</p>}
    <p className="feed-updated">Quelle: Awin-Produktfeed „Default“ von bdr-beauty DE, Feedimport laut Awin am {affiliateFeedImported}. Produktpreise und Verfügbarkeit können sich seitdem geändert haben. Aktuelle Angaben stehen beim Händler.</p>
  </>;
}
