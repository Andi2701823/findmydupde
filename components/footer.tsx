import Link from "next/link";
export function Footer() {
  return <footer className="footer"><div className="shell">
    <div className="footer-top"><div><Link className="logo" href="/">findmydup<span className="logo-dot">.</span></Link><p>Wissen, das beim Einkaufen hilft.</p></div>
      <div className="footer-links">
        <Link href="/produkte/">Beauty-Produkte</Link>
        <Link href="/ratgeber/">Einkaufsratgeber</Link>
        <Link href="/suche/">Themensuche</Link>
        <Link href="/ueber-uns/">Über uns</Link>
        <Link href="/partner/">Für Händler</Link>
        <Link href="/datenschutz/">Datenschutz</Link>
        <Link href="/impressum/">Impressum</Link>
      </div>
    </div>
    <div className="footer-bottom"><span>© {new Date().getFullYear()} FindMyDup</span><span>Unabhängige Einkaufsratgeber · Klarheit statt Kaufdruck</span></div>
  </div></footer>;
}
