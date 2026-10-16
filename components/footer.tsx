import {supportEmail} from "@/lib/site-contact";
import Link from "next/link";
export function Footer() {
  return <footer className="footer"><div className="shell">
    <div className="footer-top"><div><Link className="logo" href="/">findmydup<span className="logo-dot">.</span></Link><p>Wissen, das beim Einkaufen hilft.</p></div>
      <div className="footer-links">
        <Link href="/produkte/">Beauty-Produkte</Link>
        <Link href="/ratgeber/">Einkaufsratgeber</Link>
        <Link href="/digitale-tools/">Digitale Tools</Link>
        <Link href="/suche/">Themensuche</Link>
        <Link href="/ueber-uns/">Über uns</Link>
        <Link href="/partner/">Für Händler</Link>
        <a href={"mailto:"+supportEmail}>Kontakt</a>
        <Link href="/datenschutz/">Datenschutz</Link>
        <Link href="/impressum/">Impressum</Link>
      </div>
    </div>
    <p className="affiliate-footer-note" id="affiliate-hinweis">* Mit einem Sternchen markierte Links sind Affiliate-Links. Bei einem Kauf über diese Links können wir eine Provision erhalten. Für dich entstehen dadurch keine zusätzlichen Kosten.</p>
    <div className="footer-bottom"><span>© {new Date().getFullYear()} FindMyDup</span><span>Unabhängige Einkaufsratgeber · Klarheit statt Kaufdruck</span></div>
  </div></footer>;
}
