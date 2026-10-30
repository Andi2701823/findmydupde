import Link from "next/link";
import { Icon } from "./icon";

/** Native GET submission avoids stale router and input state for repeat searches. */
export function SearchBox({ compact = false, initialQuery = "", initialSource = "all" }: { compact?: boolean; initialQuery?: string; initialSource?: string }) {
  const queryId=compact?"results-product-query":"home-product-query";
  const destination=(value:string)=>"/suche/?q="+encodeURIComponent(value)+(initialSource!=="all"?"&source="+encodeURIComponent(initialSource):"");
  return <section id={compact?"neue-suche":undefined} className={"search-box editorial-search "+(compact ? "compact" : "")} aria-label={compact?"Erneut nach Produkten suchen":"Produkte und Ratgeber suchen"}>
    {compact&&<div className="repeat-search-heading"><strong>Neue Suche starten</strong><span>Suchbegriff ändern und erneut suchen.</span></div>}
    <form role="search" className="text-search" method="get" action="/suche/">
      <label className="sr-only" htmlFor={queryId}>Thema oder Produkt suchen</label>
      <Icon name="search" />
      <input key={initialQuery} id={queryId} name="q" type="search" maxLength={120} required defaultValue={initialQuery}
        placeholder="Produktname oder Suchbegriff eingeben" />
      {initialSource!=="all"&&<input type="hidden" name="source" value={initialSource}/>}
      <button className="button primary" type="submit">{compact?"Neu suchen":"Entdecken"} <Icon name="arrow" /></button>
    </form>
    {!compact&&<div className="suggestions">
      <span>Oft gesucht:</span>
      {["Serum","Genie","Ranger"].map(word => <Link href={destination(word)} key={word}>{word} ↗</Link>)}
    </div>}
    {compact&&initialSource!=="all"&&<p className="repeat-search-scope">Suche innerhalb der gewählten Quelle. <Link href="/suche/">Stattdessen alle Quellen durchsuchen</Link></p>}
    {!compact&&<p className="search-note"><Icon name="shield" /> Suche ohne Anmeldung. Händlerpreise und Verfügbarkeit bitte im jeweiligen Shop prüfen.</p>}
  </section>;
}
