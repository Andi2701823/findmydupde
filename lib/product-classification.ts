/** Conservative cross-merchant product families. Unknown products remain searchable. */
const families={
 headphones:/^(?:kopfhorer(?:n)?|headphones?|headsets?|ohrhorer(?:n)?|earbuds?|earphones?)$/,
 phones:/^(?:smartphones?|handys?|iphone|pixel)$/,
 tablets:/^(?:tablets?|ipad)$/,
 computers:/^(?:macbook|imac|laptops?|notebooks?)$/,
 televisions:/^(?:fernseher|fernsehgerat|tvs?|televisions?)$/,
 monitors:/^(?:monitore?|bildschirme?)$/,
 cameras:/^(?:uberwachungskameras?|sicherheitskameras?|kameras?|securitycamera)$/,
 mowers:/^(?:mahroboter|rasenmahroboter|rasenmaher)$/,
 vacuums:/^(?:staubsauger|saugroboter|staubsaugerroboter|akkustaubsauger)$/,
 watches:/^(?:smartwatches?|smartwatch|applewatch)$/
} as const;
export type ProductFamily=keyof typeof families;
export type ProductKind=ProductFamily|"accessory"|"unknown";
function tokens(value:string){
 return value.normalize("NFKD").replace(/\p{M}/gu,"").toLowerCase().split(/[^\p{L}\p{N}]+/u).filter(Boolean);
}
const accessory=/^(?:audio(?:kabel|adapter)|auxkabel|klinken(?:kabel|stecker|adapter)|ladekabel|ladegerat(?:e)?|ladecase|ladeetui|ladestation|netzteil|netzadapter|adapter|kabel|ersatzkabel|verlangerungskabel|ohrpolster|ersatzpolster|ohrmuscheln|ohrstopsel|ersatzteile?|reparaturset|halterung|wandhalterung|stander|staender|tasche|etui|case|cover|schutzhulle|schutzfolie|panzerglas|schutzglas|fernbedienung|ersatzakku|ersatzmesser|ersatzklingen|klingen|messersatz|filter|ersatzfilter|staubsaugerbeutel|staubbeutel|ersatzburste|burstenrolle|armband|schutzrahmen|sleeve|dock|dockingstation|hub|zubehor|accessor(?:y|ies))$/;
const compoundAccessory=/(?:kopfhorer|handy|smartphone|tablet|laptop|kamera|monitor|fernseher|mahroboter|staubsauger|smartwatch)(?:halterung|stander|tasche|hulle|kabel|schutzfolie|armband|filter|beutel|zubehor|ersatzteile)$/;
function accessoryWord(word:string){return accessory.test(word)||compoundAccessory.test(word);}
function familyOf(word:string):ProductFamily|undefined{
 return (Object.keys(families) as ProductFamily[]).find(f=>families[f].test(word));
}
export function productIntent(query:string):ProductFamily|undefined{
 const p=tokens(query);
 if(p.some(accessoryWord))return undefined;
 return p.map(familyOf).find((f):f is ProductFamily=>f!==undefined);
}
export function classifyProduct(title:string,category?:string):ProductKind{
 const p=tokens(title);
 const cat=tokens(category??"");
 // Only an explicit accessory category is trusted as a negative signal.
 // Broad merchant categories such as Technik and Audio are not product types.
 if(cat.length===1&&["zubehor","accessories","accessory"].includes(cat[0]))return "accessory";
 const index=p.findIndex(w=>familyOf(w)!==undefined);
 if(index<0)return p.some(accessoryWord)?"accessory":"unknown";
 const before=p.slice(0,index),after=p.slice(index+1);
 if(before.some(accessoryWord)||before.some(w=>["fur","fuer","for","kompatibel","compatible","passend"].includes(w)))return "accessory";
 if(after.length&&accessoryWord(after[0]))return "accessory";
 // Bundled extras ("mit Kabel", "inkl. Filter") do not turn devices into accessories.
 if(after.some(w=>compoundAccessory.test(w))&&!after.some(w=>["mit","inkl","inklusive","with","bundle","set"].includes(w)))return "accessory";
 return familyOf(p[index])??"unknown";
}
export function matchesProductIntent(title:string,query:string,category?:string):boolean{
 const intent=productIntent(query);
 if(!intent)return true;
 const kind=classifyProduct(title,category);
 // Unknown is deliberately not excluded: model names and mixed-language feeds
 // may not contain a recognized product noun. Existing title checks still apply.
 return kind==="unknown"||kind===intent;
}
