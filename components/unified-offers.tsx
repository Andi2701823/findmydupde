"use client";
import {useEffect,useMemo,useState} from "react";
import Image from "next/image";
import type {AffiliateProduct} from "@/lib/affiliate-products";
import {anthbotOffers,beautyOffers,ebayOffers,feedOffers,rankedOffers,sortOffers,knownTotal,type OfferSort,type OfferSource,type SearchOffer} from "@/lib/unified-offers";
import type {AnthbotProduct} from "@/lib/anthbot-products";

type Enabled={samsung:boolean;joybuy:boolean;mactrade:boolean;imou:boolean;ebay:boolean};
type Current={key:string;offers:SearchOffer[];pending:number;failed:OfferSource[]};
const format=new Intl.NumberFormat("de-DE",{style:"currency",currency:"EUR"});
function euro(cents:number){return format.format(cents/100);}
const sources=["samsung","joybuy","mactrade","imou","ebay"] as const;
function priceContext(offer:SearchOffer):string{
 if(offer.priceUpdated){
  const date=new Date(offer.priceUpdated);
  if(Number.isFinite(date.getTime()))return (offer.source==="ebay"?"Preis erfasst: ":"Feedstand: ")+new Intl.DateTimeFormat("de-DE",{dateStyle:"medium",timeZone:"Europe/Berlin"}).format(date);
 }
 return offer.source==="ebay"?"Zeitpunkt nicht angegeben":"Feedpreis · Stand nicht angegeben";
}
function OfferRow({offer,highlight,selected,onToggle,selectionFull}:{offer:SearchOffer;highlight:string|null;selected:boolean;onToggle:()=>void;selectionFull:boolean}){
  const [broken,setBroken]=useState(false);
  const total=knownTotal(offer);
  return <article className={"unified-offer"+(highlight?" first":"")} data-source={offer.source} data-article-cents={offer.articleCents}>
    {highlight&&<span className="unified-offer-best">{highlight}</span>}
    <div className="unified-offer-body">
      <div className="unified-offer-image">
        {broken?<span aria-hidden="true">Bild</span>:<Image src={offer.image} width={100} height={100} alt="" loading="lazy" unoptimized referrerPolicy="no-referrer" onError={()=>setBroken(true)}/>}
      </div>
      <div className="unified-offer-info">
        <h3>{offer.title}</h3>
        <span>{offer.merchant} · Zustand: {offer.condition||"nicht angegeben"}</span>
        <span>{priceContext(offer)}</span>
        <label className="offer-compare-choice"><input type="checkbox" checked={selected} disabled={!selected&&selectionFull} onChange={onToggle}/> Zum Vergleich auswählen</label>
      </div>
      <div className="unified-offer-price">
        <strong>{euro(offer.articleCents)}</strong>
        <span>Artikelpreis</span>
        {total!==null?<small>inkl. genanntem Versand: {euro(total)}</small>:<small>Versandkosten prüfen</small>}
      </div>
      <a className="button secondary unified-offer-action" href={offer.href} target="_blank"
        rel={offer.source==="ebay"?"noopener noreferrer":"sponsored nofollow noopener noreferrer"}>
        Beim Händler prüfen{offer.source==="ebay"?"":"*"} ↗
      </a>
    </div>
  </article>;
}
export function UnifiedOffers({query,beauty,anthbot,enabled}:{query:string;beauty:AffiliateProduct[];anthbot:AnthbotProduct[];enabled:Enabled}){
  const {samsung,joybuy,mactrade,imou,ebay}=enabled;
  const enabledSources={samsung,joybuy,mactrade,imou,ebay};
  const key=query+":"+sources.map(s=>String(enabledSources[s])).join(":");
  const [state,setState]=useState<Current|null>(null);
  const [visible,setVisible]=useState(5);
  const [sort,setSort]=useState<OfferSort>("article");
  const [selectedIds,setSelectedIds]=useState<string[]>([]);
  const start=useMemo(()=>[...beautyOffers(beauty),...anthbotOffers(anthbot)],[beauty,anthbot]);
  useEffect(()=>{
    const controller=new AbortController();
    const requested=sources.filter(source=>enabledSources[source]);
    for(const source of requested){
      fetch("/api/"+source+"/search/?q="+encodeURIComponent(query),{signal:controller.signal,cache:"no-store"})
        .then(async response=>{if(!response.ok)throw Error("Unavailable");return await response.json() as unknown;})
        .then(data=>source==="ebay"?ebayOffers(data):feedOffers(source,data))
        .then(offers=>{
          if(!controller.signal.aborted)setState(current=>{
            const base=current?.key===key?current:{key,offers:start,pending:requested.length,failed:[]};
            return {...base,offers:[...base.offers,...offers],pending:base.pending-1};
          });
        })
        .catch(()=>{
          if(!controller.signal.aborted)setState(current=>{
            const base=current?.key===key?current:{key,offers:start,pending:requested.length,failed:[]};
            return {...base,pending:base.pending-1,failed:[...base.failed,source]};
          });
        });
    }
    return ()=>controller.abort();
  },[key,query,start,samsung,joybuy,mactrade,imou,ebay]);
  const active=state?.key===key?state:null;
  const offers=sortOffers(rankedOffers(active?.offers??start,query),sort);
  const selected=offers.filter(o=>selectedIds.includes(o.id));
  function toggle(id:string){setSelectedIds(ids=>ids.includes(id)?ids.filter(x=>x!==id):ids.length<3?[...ids,id]:ids);}
  const pending=active?.pending??sources.filter(source=>enabledSources[source]).length;
  return <section className="unified-results" aria-label="Preisübersicht über Händler">
    <div className="unified-results-heading">
      <div><span className="eyebrow">ERGEBNISSE AUS ALLEN VERFÜGBAREN HÄNDLERN</span>
        <h2>Passende Angebote nach Preis vergleichen</h2>
        <p>Vergleiche Artikelpreise oder Preise inklusive bekanntem Versand. Prüfe Modell, Lieferumfang und Zustand.</p>
      </div>
      <span className="unified-results-count" role="status">{offers.length} angezeigte Treffer{pending?" · weitere werden geladen":""}</span>
    </div>
    {offers.length>0?<>
      <div className="offer-compare-controls"><label>Sortieren nach <select value={sort} onChange={e=>{setSort(e.target.value==="total"?"total":"article");setVisible(5);}}><option value="article">Artikelpreis (aufsteigend)</option><option value="total">Artikelpreis + bekannter Versand</option></select></label><span>{selected.length} von 3 Vergleichsplätzen belegt</span></div>
      {sort==="total"&&<p className="unified-results-note">Treffer ohne bekannten Versand stehen am Ende. Auch angegebene Versandkosten können sich ändern.</p>}
      {selected.length>0&&<section className="offer-comparison" aria-label="Ausgewählte Angebote vergleichen"><h3>Deine Vergleichsauswahl</h3><p>Die ausgewählten Treffer sind nicht automatisch gleichwertig. Vergleiche die vollständige Modellbezeichnung und den Zustand.</p>
        <div className="offer-comparison-grid">{selected.map(o=><article key={o.id}><h4>{o.title}</h4><dl><dt>Händler</dt><dd>{o.merchant}</dd><dt>Zustand</dt><dd>{o.condition||"Nicht angegeben"}</dd><dt>Artikelpreis</dt><dd>{euro(o.articleCents)}</dd><dt>Versand</dt><dd>{o.shippingCents===null?"Unbekannt":euro(o.shippingCents)}</dd><dt>Preis inkl. genanntem Versand</dt><dd>{knownTotal(o)===null?"Nicht berechenbar":euro(knownTotal(o)!)}</dd><dt>Datenstand</dt><dd>{priceContext(o)}</dd></dl><button type="button" className="button secondary" onClick={()=>toggle(o.id)}>Aus Vergleich entfernen</button></article>)}</div>
      </section>}
      <div className="unified-offer-list">{offers.slice(0,visible).map((offer,i)=><OfferRow key={offer.id} offer={offer} highlight={i===0&&pending===0?(sort==="article"?"Niedrigster Artikelpreis der geladenen Treffer":knownTotal(offer)!==null?"Niedrigster Preis inkl. bekanntem Versand":null):null} selected={selectedIds.includes(offer.id)} selectionFull={selectedIds.length>=3} onToggle={()=>toggle(offer.id)}/>)}</div>
      {visible<offers.length&&<button type="button" className="button secondary unified-more" onClick={()=>setVisible(n=>n+10)}>
        Weitere passende Angebote anzeigen ({offers.length-visible})
      </button>}
    </>:active?.pending?<p role="status">Passende Angebote und Preise werden geladen …</p>:
      <p className="empty-state" role="status">Keine passenden Händlerangebote gefunden. Versuche einen anderen Suchbegriff.</p>}
    {active?.failed.length?<p className="unified-results-notice">Einige Händler konnten nicht geladen werden. Die Preisübersicht ist möglicherweise unvollständig.</p>:null}
    <p className="unified-results-note">* Affiliate-Links können uns eine Provision einbringen. Für dich entstehen keine zusätzlichen Kosten.</p>
    <p className="unified-results-note">Dies sind Treffer zu deinem Suchbegriff, nicht automatisch identische Produkte. Unterschiedliche Modelle, Größen und Zustände sind möglich. Es werden nur geladene Angebote berücksichtigt. Händlerpreise stammen teilweise aus älteren Feeds und können sich geändert haben; verbindlich sind die Angaben im Shop.</p>
  </section>;
}
