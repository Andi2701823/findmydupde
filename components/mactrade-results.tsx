"use client";
import {useEffect,useState} from "react";
import Link from "next/link";
import type {MactradeProduct} from "@/lib/mactrade-catalog";
import {MactradeProductCard} from "./mactrade-product-card";
type Response={products:MactradeProduct[];total:number};
export function MactradeResults({query}:{query:string}){
  const [state,setState]=useState<{key:string,products:MactradeProduct[],total:number,error:boolean}|null>(null);
  useEffect(()=>{
    const controller=new AbortController();
    fetch("/api/mactrade/search/?q="+encodeURIComponent(query),{signal:controller.signal,cache:"no-store"})
      .then(async response=>{if(!response.ok)throw Error("Unavailable");return await response.json() as Response;})
      .then(data=>{if(!controller.signal.aborted)setState({key:query,products:data.products,total:data.total,error:false});})
      .catch(()=>{if(!controller.signal.aborted)setState({key:query,products:[],total:0,error:true});});
    return ()=>controller.abort();
  },[query]);
  const loading=state?.key!==query;
  return <section className="search-products" aria-label="MacTrade-Angebote">
    <div className="section-heading"><div>
      <span className="eyebrow">MACTRADE · AWIN</span>
      <h2>MacTrade-Angebote {loading?"werden geladen":state?.total?"("+state.total+")":""}</h2>
      <p>Apple-Produkte und Zubehör, Preise aus einem importierten Händlerfeed.</p>
    </div><Link href={"/mactrade/?q="+encodeURIComponent(query)} className="text-link">Alle MacTrade-Treffer →</Link></div>
    {loading?<p role="status">MacTrade-Angebote werden geladen …</p>:
     state?.error?<p role="status">MacTrade-Angebote sind momentan nicht verfügbar.</p>:
     state?.products.length?<div className="affiliate-grid">{state.products.map(p=><MactradeProductCard key={p.aw_product_id} product={p}/>)}</div>:
     <p role="status">Keine passenden MacTrade-Produkte gefunden.</p>}
  </section>;
}
