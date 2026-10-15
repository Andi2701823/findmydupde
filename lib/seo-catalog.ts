import type {Metadata} from "next";

type Params=Record<string,string|string[]|undefined>;
const filterKeys=new Set(["q","category","brand","min","max","sort","page"]);

/**
 * Only the unfiltered merchant landing page is eligible for indexing.
 * Arbitrary search/price/filter/pagination combinations remain usable
 * by visitors but must not become thousands of thin Google landing pages.
 * Keep filtered URLs crawlable; Google must be able to read their noindex tag.
 */
export function merchantCatalogMetadata(config:{
  title:string;description:string;canonical:string;params:Params;
}):Metadata{
  const filtered=Object.entries(config.params).some(([key,value])=>
    filterKeys.has(key)&&(Array.isArray(value)?value.some(Boolean):Boolean(value)));
  return {
    title:config.title,
    description:config.description,
    ...(filtered?{robots:{index:false,follow:true}}:{alternates:{canonical:config.canonical}}),
  };
}
