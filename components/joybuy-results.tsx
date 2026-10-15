"use client";
import {useEffect,useState} from "react";
import Link from "next/link";
import type {JoybuyProduct} from "@/lib/joybuy-catalog";
import {JoybuyProductCard} from "./joybuy-product-card";
type Response={products:JoybuyProduct[];total:number};
export function JoybuyResults({query}:{query:string}){
  const [state,setState]=useState<{key:string,products:JoybuyProduct[],total:number,error:boolean}|null>(null);
  useEffect(()=>{
    const controller=new AbortController();
    fetch("/api/joybuy/search/?q="+encodeURIComponent(query),{signal:controller.signal,cache:"no-store"})
      .then(async response=>{if(!response.ok)throw Error("Unavailable");return await response.json() as Response;})
      .then(d=>{if(!controller.signal.aborted)setState({key:query,products:d.products,total:d.total,error:false});})
      .catch(()=>{if(!controller.signal.aborted)setState({key:query,products:[],total:0,error:true});});
    return ()=>controller.abort();
  },[query]);
  const loading=state?.key!==query;
  return <section className="search-products" aria-label="JoyBuy-Angebote">
    <div className="section-heading">
      <div><span className="eyebrow">JOYBUY DE · AWIN</span><h2>JoyBuy-Angebote {loading?"werden geladen":state?.total?("("+state.total+")"):""}</h2>
        <p>Artikelpreise aus dem importierten Feed, keine live bestätigten Angebote.</p>
      </div>
      <Link href={"/joybuy/?q="+encodeURIComponent(query)} className="text-link">Alle JoyBuy-Treffer anzeigen →</Link>
    </div>
    {loading?<p role="status">JoyBuy-Angebote werden geladen …</p>:state?.error?<p role="status">JoyBuy-Angebote sind momentan nicht verfügbar.</p>:
     state?.products.length?<div className="affiliate-grid">{state.products.map(p=><JoybuyProductCard key={p.external_id} product={p}/>)}</div>:
     <p role="status">Keine passenden JoyBuy-Produkte gefunden.</p>}
  </section>;
}
