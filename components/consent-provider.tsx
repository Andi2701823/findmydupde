"use client";
import {createContext,useContext,useEffect,useState} from "react";
import Link from "next/link";
type Choice="accepted"|"rejected"|null;
const key="findmydup:affiliate-consent:v1";
const ConsentContext=createContext<Choice>(null);
export const useAffiliateConsent=()=>useContext(ConsentContext);
export function ConsentProvider({children}:{children:React.ReactNode}){
 const [choice,setChoice]=useState<Choice>(null);
 const [loaded,setLoaded]=useState(false);
 const [settings,setSettings]=useState(false);
 useEffect(()=>{
   const timer=window.setTimeout(()=>{
     try {const saved=localStorage.getItem(key);if(saved==="accepted"||saved==="rejected")setChoice(saved);}catch{}
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
 function decide(next:Exclude<Choice,null>){
   try{localStorage.setItem(key,next);}catch{}
   setChoice(next);setSettings(false);
 }
 return <ConsentContext.Provider value={loaded?choice:null}>
  {children}
  {loaded&&(choice===null||settings)&&<div className="consent-layer" role="dialog" aria-modal="false" aria-labelledby="consent-title" aria-describedby="consent-description">
    <div className="consent-card">
      <strong id="consent-title">Deine Privatsphäre bei FindMyDup</strong>
      <p id="consent-description">Wir verwenden notwendige Browserfunktionen für die Website. Mit deiner freiwilligen Zustimmung laden wir externe Werbebanner und ermöglichen die Zuordnung von Affiliate-Klicks und möglichen Käufen. Dafür nutzen wir unseren Werbepartner Awin. Ohne Zustimmung kannst du die Produktsuche weiterhin nutzen. Du kannst deine Wahl jederzeit hier ändern.</p>
      <p><Link href="/datenschutz/">Datenschutzerklärung</Link> · <Link href="/impressum/">Impressum</Link></p>
      <div className="consent-actions">
        <button type="button" onClick={()=>decide("rejected")}>Nur notwendige</button>
        <button type="button" onClick={()=>decide("accepted")}>Werbung & Tracking erlauben</button>
      </div>
    </div>
  </div>}
  <button type="button" className="consent-settings-link" onClick={()=>setSettings(true)}>Datenschutzeinstellungen</button>
 </ConsentContext.Provider>;
}
