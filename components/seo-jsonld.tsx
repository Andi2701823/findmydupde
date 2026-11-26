import {supportEmail} from "@/lib/site-contact";

type Crumb={name:string;url:string};

function safeJson(value:unknown){
  // Prevent literal "<" in user-facing JSON-LD and close-tag injection.
  return JSON.stringify(value).replace(/</g,"\\u003c");
}
export function BreadcrumbJsonLd({items}:{items:Crumb[]}){
  const data={
    "@context":"https://schema.org",
    "@type":"BreadcrumbList",
    itemListElement:items.map(({name,url},index)=>({
      "@type":"ListItem",
      position:index+1,
      name,
      item:url,
    })),
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{__html:safeJson(data)}}/>;
}
export function WebsiteJsonLd(){
  const data={
    "@context":"https://schema.org",
    "@type":"WebSite",
    name:"FindMyDup",
    url:"https://findmydup.de/",
    inLanguage:"de-DE",
    description:"Produkte, Händlerangebote und digitale Tools entdecken und mit Einkaufsratgebern einordnen.",
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{__html:safeJson(data)}}/>;
}

/** First-party business identity only; no invented qualifications or third-party ratings. */
export function OrganizationJsonLd(){
  const data={
    "@context":"https://schema.org",
    "@type":"Organization",
    "@id":"https://findmydup.de/#organization",
    name:"FindMyDup",
    url:"https://findmydup.de/",
    logo:"https://findmydup.de/icon.svg",
    email:supportEmail,
    contactPoint:{"@type":"ContactPoint",email:supportEmail,contactType:"customer support",availableLanguage:"de"},
    description:"Deutschsprachige Produktsuche mit transparenten Händlerangeboten und Einkaufsratgebern.",
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{__html:safeJson(data)}}/>;
}

/** Include only dates supported by editorial history. */
export function ArticleJsonLd({headline,description,category,keywords,url,datePublished,dateModified}:{
  headline:string;description:string;category:string;keywords:string[];url:string;datePublished?:string;dateModified?:string;
}){
  const data={
    "@context":"https://schema.org",
    "@type":"Article",
    "@id":url+"#article",
    headline,
    description,
    inLanguage:"de-DE",
    mainEntityOfPage:{"@type":"WebPage","@id":url},
    articleSection:category,
    ...(datePublished ? {datePublished} : {}),
    ...(dateModified ? {dateModified} : {}),
    keywords,
    author:{"@type":"Organization","@id":"https://findmydup.de/#organization","name":"FindMyDup"},
    publisher:{"@type":"Organization","@id":"https://findmydup.de/#organization","name":"FindMyDup"},
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{__html:safeJson(data)}}/>;
}

/** Descriptive product facts only. Historical Awin prices are not current Offers. */
export function ProductInfoJsonLd({name,image,description,url}:{
  name:string;image:string;description:string;url:string;
}){
  const data={
    "@context":"https://schema.org",
    "@type":"Product",
    "@id":url+"#product",
    name,
    image:[image],
    description,
    url,
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{__html:safeJson(data)}}/>;
}
