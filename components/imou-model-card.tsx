"use client";
import {useState} from "react";
import Image from "next/image";
import Link from "next/link";
import {Icon} from "@/components/icon";
import {euroImou} from "@/lib/imou-prices";
export type ImouCardInfo={slug:string;name:string;category:string;image:string;minPriceCents:number;variantCount:number};
export function ImouModelCard({model}:{model:ImouCardInfo}){
 const [broken,setBroken]=useState(false);
 return <article className="affiliate-card imou-model-card">
  <div className="affiliate-image">
   {broken?<div className="image-fallback"><Icon name="image"/><span>Bild beim Händler ansehen</span></div>:
    <Image src={model.image} alt={model.name} width={340} height={340} unoptimized loading="lazy" onError={()=>setBroken(true)}/>}
  </div>
  <div className="affiliate-body">
   <span className="affiliate-category">{model.category} · IMOU DE</span>
   <h3><Link href={"/imou/"+model.slug+"/"}>{model.name}</Link></h3>
   <p className="affiliate-disclosure">{model.variantCount} verfügbare Varianten im Feed</p>
   <div className="affiliate-price">
    <strong>Ab {euroImou(model.minPriceCents)}</strong>
    <small>Günstigste Variante laut Awin-Feed vom 16.10.2026, kein Live-Preis</small>
   </div>
   <Link href={"/imou/"+model.slug+"/"} className="button primary affiliate-shop-link">Varianten ansehen <Icon name="arrow"/></Link>
  </div>
 </article>;
}
