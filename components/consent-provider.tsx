"use client";
import {createContext,useContext,useEffect,useState} from "react";
import Link from "next/link";
type Choice="accepted"|"rejected"|null;
const key="findmydup:affiliate-consent:v1";
const analyticsKey="findmydup:analytics-consent:v1";
const measurementId="G-D3QN1F7G47";
const ConsentContext=createContext<Choice>(null);
export const useAffiliateConsent=()=>useContext(ConsentContext);
export function ConsentProvider({children}:{children:React.ReactNode}){
 const [choice,setChoice]=useState<Choice>(null);
 const [loaded,setLoaded]=useState(false);
 const [settings,setSettings]=useState(false);
 const [affiliateDraft,setAffiliateDraft]=useState(false);
 const [analytics,setAnalytics]=useState(false);
 const [analyticsGranted,setAnalyticsGranted]=useState(false);
 const [analyticsChoiceKnown,setAnalyticsChoiceKnown]=useState(false);
 useEffect(()=>{
   const timer=window.setTimeout(()=>{
     try {const saved=localStorage.getItem(key);if(saved==="accepted"||saved==="rejected"){setChoice(saved);setAffiliateDraft(saved==="accepted");}const storedAnalytics=localStorage.getItem(analyticsKey);const granted=storedAnalytics==="accepted";setAnalytics(granted);setAnalyticsGranted(granted);setAnalyticsChoiceKnown(storedAnalytics==="accepted"||storedAnalytics==="rejected");}catch{}
     setLoaded(true);
   },0);
   return ()=>window.clearTimeout(timer);
 },[]);
 useEffect(()=>{
   if(!loaded)return;
   // Advertiser-side tracking must get an explicit consent signal on each click.
   const update=(event:MouseEvent)=>{
     const target=event.target;
     if(!(target instanceof Element))return;
     const anchor=target.closest("a[href]");
     if(!(anchor instanceof HTMLAnchorElement))return;
     try{
       const url=new URL(anchor.href);
       if(url.hostname!=="www.awin1.com"||!["/cread.php","/pclick.php"].includes(url.pathname))return;
       url.searchParams.set("cons",choice==="accepted"?"1":"0");
       anchor.href=url.toString();
     }catch{}
   };
   document.addEventListener("click",update,true);
   document.addEventListener("auxclick",update,true);
   return ()=>{document.removeEventListener("click",update,true);document.removeEventListener("auxclick",update,true);};
 },[loaded,choice]);
 useEffect(()=>{
   if(!loaded||!analyticsGranted)return;
   // Basic consent mode: never download Google Analytics before opt-in.
   const w=window as Window & {dataLayer?:unknown[];gtag?:(...args:unknown[])=>void};
   w.dataLayer=w.dataLayer||[];
   w.gtag=(...args:unknown[])=>{w.dataLayer?.push(args);};
   w.gtag("consent","default",{analytics_storage:"denied",ad_storage:"denied",ad_user_data:"denied",ad_personalization:"denied"});
   w.gtag("consent","update",{analytics_storage:"granted",ad_storage:"denied",ad_user_data:"denied",ad_personalization:"denied"});
   w.gtag("js",new Date());
   w.gtag("config",measurementId);
   if(!document.querySelector('script[data-findmydup-analytics]')){
     const script=document.createElement("script");
     script.async=true;
     script.dataset.findmydupAnalytics="true";
     script.src="https://www.googletagmanager.com/gtag/js?id="+measurementId;
     document.head.appendChild(script);
   }
 },[loaded,analyticsGranted]);
 useEffect(()=>{
   if(!loaded||analyticsGranted)return;
   const w=window as Window & {gtag?:(...args:unknown[])=>void};
   w.gtag?.("consent","update",{analytics_storage:"denied",ad_storage:"denied",ad_user_data:"denied",ad_personalization:"denied"});
 },[loaded,analyticsGranted]);
 function decide(next:Exclude<Choice,null>, allowAnalytics=analytics){
   try{localStorage.setItem(key,next);localStorage.setItem(analyticsKey,allowAnalytics?"accepted":"rejected");}catch{}
   setAffiliateDraft(next==="accepted");setAnalytics(allowAnalytics);setAnalyticsGranted(allowAnalytics);setAnalyticsChoiceKnown(true);setChoice(next);setSettings(false);
 }
 return <ConsentContext.Provider value={loaded?choice:null}>
  {children}
  {loaded&&(choice===null||!analyticsChoiceKnown||settings)&&<div className="consent-layer" role="dialog" aria-modal="false" aria-labelledby="consent-title" aria-describedby="consent-description">
    <div className="consent-card">
      <strong id="consent-title">Deine Privatsphäre bei FindMyDup</strong>
      <p id="consent-description">Wir verwenden notwendige Browserfunktionen für die Website. Mit deiner freiwilligen Zustimmung laden wir externe Werbebanner und ermöglichen die Zuordnung von Affiliate-Klicks und möglichen Käufen. Dafür nutzen wir unseren Werbepartner Awin. Google Analytics setzen wir nur ein, wenn du der statistischen Auswertung zustimmst. Ohne Zustimmung kannst du die Produktsuche weiterhin nutzen. Du kannst deine Wahl jederzeit hier ändern.</p>
      <label style={{display:"flex",alignItems:"center",gap:8,margin:"12px 0"}}><input type="checkbox" checked={affiliateDraft} onChange={e=>setAffiliateDraft(e.target.checked)}/> Externe Partnerwerbung und Affiliate-Tracking erlauben</label>
      <label style={{display:"flex",alignItems:"center",gap:8,margin:"12px 0"}}><input type="checkbox" checked={analytics} onChange={e=>setAnalytics(e.target.checked)}/> Besucherstatistik mit Google Analytics erlauben</label>
      <p><Link href="/datenschutz/">Datenschutzerklärung</Link> · <Link href="/impressum/">Impressum</Link></p>
      <div className="consent-actions">
        <button type="button" onClick={()=>decide("rejected",false)}>Nur notwendige</button>
        <button type="button" onClick={()=>decide(affiliateDraft?"accepted":"rejected",analytics)}>Auswahl speichern</button>
        <button type="button" onClick={()=>decide("accepted",true)}>Alle erlauben</button>
      </div>
    </div>
  </div>}
  <button type="button" className="consent-settings-link" onClick={()=>setSettings(true)}>Datenschutzeinstellungen</button>
 </ConsentContext.Provider>;
}
