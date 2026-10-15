// Pure helpers reused by a server-only feed importer and offline tests.
export function samsungFeedCategory(name:string,source:string) {
  const t=name.toLowerCase();
  const has=(re:RegExp)=>re.test(t);
  if(has(/\b(case|cover|wallet|strap|adapter|ladegerät|screen protector|skin|remote|band |keyboard cover)\b|hülle|rahmen|halterung|schutzfolie|schutzhülle|ladeadapter|ladekabel|kabel|wischaufsatz|filter|akku|staubbeutel|fernbedienung|zwischenbau|pen für/i))return "Zubehör";
  if(source==="Memory Storage"||has(/\b(ssd|sdxc|microsd|flash drive|usb-stick)\b|speicherkarte/i))return "Speicher & SSD";
  if(has(/\bmonitor\b|viewfinity|odyssey/i))return "Monitore";
  if(has(/smart tv|qled|oled|crystal uhd|mini led|vision ai smart tv/i))return "Fernseher";
  if(has(/galaxy tab\b|\btablet\b/i))return "Tablets";
  if(has(/galaxy watch\b|\bsmartwatch\b/i))return "Smartwatches";
  if(has(/galaxy buds\b|soundbar|lautsprecher|speaker/i))return "Audio";
  if(has(/galaxy (?:s\d{2}|a\d{2}|z (?:flip|fold))\b|\bsmartphone\b/i))return "Smartphones";
  if(["Home Appliances","Haushalt"].includes(source) ||has(/wasch|kühl|gefrier|side.by.side|french door|trockn|staubsauger|clean station|bespoke ai jet|geschirrspüler|backofen|kochfeld|mikrowelle|wassertank|jet bot/i))return "Haushaltsgeräte";
  if(["IT - Mobile","Mobile","AEM"].includes(source))return "Zubehör";
  return "Sonstiges";
}
export function parseSamsungMoney(value:string):number|null {
  if(!value)return null;
  if(!/^\d+(?:\.\d{1,2})?$/.test(value))throw new Error("Invalid feed price");
  const [eur,cents=""]=value.split(".");
  const amount=Number(eur)*100+Number(cents.padEnd(2,"0"));
  if(!Number.isSafeInteger(amount)||amount<0||amount>100_000_000)throw new Error("Out-of-range feed price");
  return amount;
}
export function parseSamsungCsv(input:string):string[][] {
  const rows:string[][]=[];let row:string[]=[],value="",quoted=false;
  for(let i=0;i<input.length;i++){
    const c=input[i];
    if(c==='"'){
      if(quoted&&input[i+1]==='"'){value+='"';i++;}
      else quoted=!quoted;
    }else if(c===','&&!quoted){row.push(value);value="";}
    else if((c==='\n'||c==='\r')&&!quoted){
      if(c==='\r'&&input[i+1]==='\n')i++;
      row.push(value);
      if(row.some(s=>s.trim()))rows.push(row);
      row=[];value="";
    }else value+=c;
  }
  if(quoted)throw new Error("Malformed CSV quote");
  if(row.length||value){row.push(value);if(row.some(s=>s.trim()))rows.push(row);}
  return rows;
}
