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
    description:"Produkte suchen, Händlerangebote vergleichen und passende Alternativen entdecken.",
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
    description:"Deutschsprachige Produktsuche mit transparenten Händlerangeboten und Einkaufsratgebern.",
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{__html:safeJson(data)}}/>;
}

/** Dates are deliberately omitted until the original publish dates can be verified. */
export function ArticleJsonLd({headline,description,category,keywords,url}:{
  headline:string;description:string;category:string;keywords:string[];url:string;
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
    keywords,
    author:{"@type":"Organization","@id":"https://findmydup.de/#organization","name":"FindMyDup"},
    publisher:{"@type":"Organization","@id":"https://findmydup.de/#organization","name":"FindMyDup"},
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{__html:safeJson(data)}}/>;
}

/** Descriptive product facts only. Our June 2026 Awin prices are not current Offers. */
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
