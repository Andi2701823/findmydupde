"use client";
import Image from "next/image";
import {useState} from "react";
import {Icon} from "./icon";
export function AffiliateDetailImage({src,alt}:{src:string;alt:string}) {
  const [failed,setFailed]=useState(false);
  return <div className="affiliate-detail-image">
    {failed ? <div className="image-fallback"><Icon name="image"/><p>Das Händlerbild ist momentan nicht verfügbar.</p></div>
      : <Image src={src} alt={alt} width={640} height={640} unoptimized referrerPolicy="no-referrer" priority onError={()=>setFailed(true)}/>}
  </div>;
}
