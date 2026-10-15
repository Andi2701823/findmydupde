"use client";
import {useEffect,useMemo,useState} from "react";
import Image from "next/image";
import type {AffiliateProduct} from "@/lib/affiliate-products";
import {beautyOffers,ebayOffers,feedOffers,rankedOffers,type OfferSource,type SearchOffer} from "@/lib/unified-offers";

type Enabled={samsung:boolean;joybuy:boolean;mactrade:boolean;ebay:boolean};
type Current={key:string;offers:SearchOffer[];pending:number;failed:OfferSource[]};
const format=new Intl.NumberFormat("de-DE",{style:"currency",currency:"EUR"});
function euro(cents:number){return format.format(cents/100);}
const sources=["samsung","joybuy","mactrade","ebay"] as const;
function OfferRow({offer,first}:{offer:SearchOffer;first:boolean}){
  const [broken,setBroken]=useState(false);
  const total=offer.shippingCents===null?null:offer.articleCents+offer.shippingCents;
  return <article className={"unified-offer"+(first?" first":"")} data-source={offer.source} data-article-cents={offer.articleCents}>
    {first&&<span className="unified-offer-best">Niedrigster Artikelpreis dieser Treffer</span>}
    <div className="unified-offer-body">
      <div className="unified-offer-image">
        {broken?<span aria-hidden="true">Bild</span>:<Image src={offer.image} width={100} height={100} alt="" loading="lazy" unoptimized onError={()=>setBroken(true)}/>}
      </div>
      <div className="unified-offer-info">
        <h3>{offer.title}</h3>
        <span>{offer.merchant}{offer.condition?" · Zustand: "+offer.condition:""}</span>
      </div>
      <div className="unified-offer-price">
        <strong>{euro(offer.articleCents)}</strong>
        <span>Artikelpreis</span>
        {total!==null?<small>inkl. genanntem Versand: {euro(total)}</small>:<small>Versandkosten prüfen</small>}
      </div>
      <a className="button secondary unified-offer-action" href={offer.href} target="_blank"
        rel={offer.source==="ebay"?"noopener noreferrer":"sponsored nofollow noopener noreferrer"}>
        Beim Händler prüfen ↗
      </a>
    </div>
  </article>;
}
export function UnifiedOffers({query,beauty,enabled}:{query:string;beauty:AffiliateProduct[];enabled:Enabled}){
  const key=query+":"+sources.map(s=>String(enabled[s])).join(":");
  const [state,setState]=useState<Current|null>(null);
  const [visible,setVisible]=useState(5);
  const start=useMemo(()=>beautyOffers(beauty),[beauty]);
  useEffect(()=>{
    const controller=new AbortController();
    const requested=sources.filter(source=>enabled[source]);
    setVisible(5);
    setState({key,offers:start,pending:requested.length,failed:[]});
    for(const source of requested){
      fetch("/api/"+source+"/search/?q="+encodeURIComponent(query),{signal:controller.signal,cache:"no-store"})
        .then(async response=>{if(!response.ok)throw Error("Unavailable");return await response.json() as unknown;})
        .then(data=>source==="ebay"?ebayOffers(data):feedOffers(source,data))
        .then(offers=>{
          if(!controller.signal.aborted)setState(current=>current?.key!==key?current:
            {...current,offers:[...current.offers,...offers],pending:current.pending-1});
        })
        .catch(()=>{
          if(!controller.signal.aborted)setState(current=>current?.key!==key?current:
            {...current,pending:current.pending-1,failed:[...current.failed,source]});
        });
    }
    return ()=>controller.abort();
  },[key,query,start,enabled.ebay,enabled.joybuy,enabled.mactrade,enabled.samsung]);
  const active=state?.key===key?state:null;
  const offers=rankedOffers(active?.offers??start,query);
  return <section className="unified-results" aria-label="Preisübersicht über Händler">
    <div className="unified-results-heading">
      <div><span className="eyebrow">ERGEBNISSE AUS ALLEN VERFÜGBAREN HÄNDLERN</span>
        <h2>Passende Angebote. Günstige zuerst.</h2>
        <p>Nach Artikelpreis sortiert, nicht nach Händler. Versand und Zustand bitte zusätzlich beachten.</p>
      </div>
      <span className="unified-results-count" role="status">{offers.length} angezeigte Treffer{active?.pending?" · weitere werden geladen":""}</span>
    </div>
    {offers.length>0?<>
      <div className="unified-offer-list">{offers.slice(0,visible).map((offer,i)=><OfferRow key={offer.id} offer={offer} first={i===0}/>)}</div>
      {visible<offers.length&&<button type="button" className="button secondary unified-more" onClick={()=>setVisible(n=>n+10)}>
        Weitere passende Angebote anzeigen ({offers.length-visible})
      </button>}
    </>:active?.pending?<p role="status">Passende Angebote und Preise werden geladen …</p>:
      <p className="empty-state" role="status">Keine passenden Händlerangebote gefunden. Versuche einen anderen Suchbegriff.</p>}
    {active?.failed.length?<p className="unified-results-notice">Einige Händler konnten nicht geladen werden. Die Preisübersicht ist möglicherweise unvollständig.</p>:null}
    <p className="unified-results-note">Dies sind Treffer zu deinem Suchbegriff, nicht automatisch identische Produkte. Unterschiedliche Modelle, Größen und Zustände sind möglich. Es werden nur geladene Angebote berücksichtigt. Händlerpreise stammen teilweise aus älteren Feeds und können sich geändert haben; verbindlich sind die Angaben im Shop.</p>
  </section>;
}
