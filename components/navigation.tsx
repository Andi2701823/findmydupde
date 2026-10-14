"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Icon } from "./icon";
export function Navigation() {
  const [open, setOpen] = useState(false);
  const path = usePathname();
  return (
    <header className="site-header">
      <div className="shell nav-row">
        <Link
          href="/"
          className="logo"
          aria-label="FindMyDup Startseite"
          onClick={() => setOpen(false)}
        >
          <span className="logo-symbol">
            f<span>↗</span>
          </span>
          findmydup<span className="logo-dot">.</span>
        </Link>
        <nav
          aria-label="Hauptnavigation"
          className={open ? "nav-links is-open" : "nav-links"}
        >
          <Link
            href="/suche/"
            aria-current={path === "/suche/" ? "page" : undefined}
            onClick={() => setOpen(false)}
          >
            Entdecken
          </Link>
          <Link href="/#so-gehts" onClick={() => setOpen(false)}>
            So funktioniert’s
          </Link>
          <Link
            href="/merkliste/"
            className="saved-link"
            aria-current={path === "/merkliste/" ? "page" : undefined}
            onClick={() => setOpen(false)}
          >
            <Icon name="heart" /> Merkliste
          </Link>
        </nav>
        <span className="demo-pill nav-demo">Im Aufbau</span>
        <button
          className="icon-button mobile-menu"
          aria-label={open ? "Menü schließen" : "Menü öffnen"}
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          <Icon name={open ? "close" : "menu"} />
        </button>
      </div>
    </header>
  );
}
