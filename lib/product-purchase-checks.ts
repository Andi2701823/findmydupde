/** Editorial purchase checks based only on product labels and catalog fields.
 * No product testing, availability promises or inferred technical specifications.
 */
export function compactDescription(text:string,limit=155):string{
 const clean=text.replace(/\s+/g," ").trim();
 if(clean.length<=limit)return clean;
 const head=clean.slice(0,limit-1);
 const boundary=head.lastIndexOf(" ");
 return (boundary>limit*0.7?head.slice(0,boundary):head).trimEnd()+"…";
}
export function beautyVolume(name:string):number|null{
 // Only an explicit single-pack ml quantity in the product name.
 if(/\d+\s*[x×]\s*\d/i.test(name))return null;
 const match=name.match(/\b(\d+(?:[.,]\d+)?)\s*ml\s*$/i);
 if(!match)return null;
 const ml=Number(match[1].replace(",","."));
 return Number.isFinite(ml)&&ml>0?ml:null;
}
export function beautySizeFamily(name:string):string|null{
 return beautyVolume(name)===null?null:name.replace(/\s+\d+(?:[.,]\d+)?\s*ml\s*$/i,"").trim().toLowerCase();
}
export function beautyPricePer100ml(name:string,priceCents:number):number|null{
 const ml=beautyVolume(name);
 return ml===null||!Number.isFinite(priceCents)||priceCents<0?null:Math.round(priceCents*100/ml);
}
export function beautyChecks(name:string,category:string):string[]{
 const checks:string[]=[];
 if(/\b(?:serum|ampullen?|booster)\b/i.test(name))checks.push("Prüfe die vorgesehene Anwendung, Wirkstoffliste und Kombination mit den übrigen Schritten deiner Pflegeroutine.");
 if(/\b(?:eye|augen)\b/i.test(name))checks.push("Kontrolliere, ob die Anwendung im Augenbereich vorgesehen ist und welche Hinweise der Hersteller zur Verträglichkeit gibt.");
 if(/\b(?:AHA|BHA|PHA|peeling|exfoliation)\b/i.test(name))checks.push("Prüfe Säureart, Konzentration, Anwendungshäufigkeit und Hinweise zum Sonnenschutz. Kombiniere exfolierende Produkte nicht allein nach ihrem Namen.");
 if(/\b(?:cream|creme)\b/i.test(name))checks.push("Vergleiche Textur, Pflegezweck und die vollständige Rezeptur mit deiner bisherigen Creme.");
 if(category==="Sonnenschutz")checks.push("Verlasse dich für den UV-Schutz auf die ausdrücklich ausgewiesene Schutzkennzeichnung des konkreten Produkts.");
 if(category==="Sets & Kuren")checks.push("Vergleiche die enthaltenen Einzelprodukte, Mengen und die vorgesehene Dauer der Kur mit deinem tatsächlichen Bedarf.");
 if(beautyVolume(name)!==null)checks.push("Vergleiche diese Packungsgröße mit anderen Größen derselben Produktlinie anhand des Preises pro 100 ml.");
 return checks;
}
export function anthbotChecks(name:string,category:string):string[]{
 const checks:string[]=[];
 const area=name.match(/(\d+)\s*m²/i);
 if(category==="Mähroboter"){
  if(area)checks.push("Die Variantenbezeichnung nennt "+area[1]+" m². Prüfe die offiziell empfohlene Mähfläche und ob sie zu den tatsächlichen Bedingungen deines Gartens passt.");
  if(/generalüberholt/i.test(name))checks.push("Die Variante ist als generalüberholt bezeichnet. Prüfe Zustand, Akkuzustand, Garantie und Rückgaberegeln; vergleiche sie nicht direkt mit Neuware.");
  if(/\b4G\b/i.test(name))checks.push("Die Bezeichnung nennt 4G. Kläre Netzabdeckung, enthaltene Mobilfunklaufzeit und mögliche spätere Gebühren.");
  if(/LiDAR/i.test(name))checks.push("Die Bezeichnung nennt LiDAR. Prüfe die Anforderungen an Kartierung und Navigation im konkreten Garten.");
  if(/\+|bundle|set/i.test(name))checks.push("Die Bezeichnung weist auf ein Paket hin. Vergleiche die enthaltenen Teile und den Paketpreis mit der passenden Einzelvariante.");
 }else{
  if(/klinge|messer/i.test(name))checks.push("Prüfe Klingentyp, Befestigung, Stückzahl und freigegebene Modellgeneration.");
  if(/batterie|akku/i.test(name))checks.push("Gleiche Kapazität, Spannung, Anschlüsse und Modellfreigabe mit dem vorhandenen Akku ab.");
  if(/ladestation|strom|kabel/i.test(name))checks.push("Prüfe Steckertyp, elektrische Daten, Kabellänge und Kompatibilität mit deiner Ladestation.");
  if(/RTK/i.test(name))checks.push("Prüfe die passende RTK-Hardware sowie Montageort und Anforderungen des vorhandenen Navigationssystems.");
  if(/garage/i.test(name))checks.push("Kontrolliere die Abmessungen, Befestigung und Freigabe für dein Mähroboter-Modell.");
 }
 return checks;
}
export function imouChecks(name:string,category:string,variantCount:number):string[]{
 const checks:string[]=[];
 if(category==="Überwachungskameras"||category==="Kamera-Sets"){
  checks.push("Vergleiche die konkrete Auflösung, den Blickwinkel und die Aufnahmefunktionen der gewählten Ausführung.");
  if(/outdoor|außen|wasserdicht/i.test(name))checks.push("Prüfe Schutzart und zulässige Betriebstemperatur für den vorgesehenen Außenstandort.");
  if(/indoor|innen/i.test(name))checks.push("Prüfe den Bildausschnitt und die Privatsphäre-Einstellungen für den vorgesehenen Innenraum.");
  if(/akku|batterie|solar|kabellos/i.test(name))checks.push("Kläre Ladeintervalle, Strombedarf, Lieferumfang und ob die gewünschten Aufnahmemodi mit Akkubetrieb unterstützt werden.");
  if(/\b4G\b|\bLTE\b/i.test(name))checks.push("Prüfe SIM-Kompatibilität, Netzabdeckung und laufende Mobilfunkkosten.");
  if(/\bPoE\b/i.test(name))checks.push("Prüfe die erforderliche PoE-Stromversorgung und Netzwerkinfrastruktur.");
  if(/PTZ|rotier|zoom/i.test(name))checks.push("Prüfe Schwenkbereich, Neigung und die Art des Zooms; ein bewegliches Objektiv ersetzt nicht automatisch eine lückenlose Abdeckung.");
 }else if(category==="Video-Türklingeln"){
  checks.push("Prüfe Stromversorgung, Klingelkompatibilität, Montagehöhe und ob ein Gong oder Monitor enthalten ist.");
 }else if(category==="Zubehör"){
  checks.push("Vergleiche die genaue Modellfreigabe, Anschlüsse und Abmessungen mit dem vorhandenen Gerät.");
 }else if(category==="Smart Home"){
  checks.push("Prüfe erforderliche Zentrale, Funkstandard, App-Kompatibilität und mögliche Abokosten.");
 }else{
  checks.push("Prüfe Einsatzbereich, Platzbedarf, Lieferumfang und Wartungsanforderungen des konkreten Geräts.");
 }
 if(/\bUK\b/i.test(name))checks.push("Die Modellbezeichnung enthält UK. Prüfe regionale Ausführung, Stecker, Garantie und Nutzbarkeit in Deutschland vor dem Kauf.");
 if(variantCount>1)checks.push("Vergleiche die "+variantCount+" gelisteten Varianten nach exakter Bezeichnung und Lieferumfang, bevor du die historischen Artikelpreise einordnest.");
 return checks;
}
