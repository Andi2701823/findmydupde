import Link from "next/link";
import { stagingLiveCatalogEnabled } from "@/server/catalog/live-mode.ts";
export function Footer() {
  const liveCatalog = stagingLiveCatalogEnabled();
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
            <Link href="/ueber-uns/">Über FindMyDup</Link>
            <Link href="/ratgeber/">Ratgeber</Link>
            <Link href="/partner/">Für Händler</Link>
            <Link href="/datenschutz/">Datenschutz</Link>
            <Link href="/impressum/">Impressum</Link>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} FindMyDup · Im Aufbau</span>
          <span>
            {liveCatalog
              ? "Textsuche mit Produktkatalog. Beispielprodukte sind als Demo gekennzeichnet."
              : "Demoprodukte und Beispielpreise. Noch keine Live-Angebote."}
          </span>
        </div>
      </div>
    </footer>
  );
}
