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
