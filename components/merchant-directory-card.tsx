import Link from "next/link";
type Props={label:string;name:string;description:string;href:string;action:string;accent?:string};
export function MerchantDirectoryCard({label,name,description,href,action,accent}:Props){
 return <article className="merchant-directory-card" data-merchant={accent||name}>
  <span className="eyebrow">{label}</span>
  <h2>{name}</h2>
  <p>{description}</p>
  <Link href={href} className="button secondary merchant-directory-link">{action} <span aria-hidden="true">→</span></Link>
 </article>;
}
