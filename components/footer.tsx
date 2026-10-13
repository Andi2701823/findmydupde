import Link from "next/link";
export function Footer() {
  return (
    <footer className="footer">
      <div className="shell">
        <div className="footer-top">
          <div>
            <Link className="logo" href="/">
              findmydup<span className="logo-dot">.</span>
            </Link>
            <p>Dein Stil. Mehr Möglichkeiten.</p>
          </div>
          <div className="footer-links">
            <Link href="/suche/">Entdecken</Link>
            <Link href="/datenschutz/">Datenschutz</Link>
            <Link href="/impressum/">Impressum</Link>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} FindMyDup · Prototyp</span>
          <span>
            Nur Demodaten. Keine echten Produkte, Preise oder Shop-Angebote.
          </span>
        </div>
      </div>
    </footer>
  );
}
