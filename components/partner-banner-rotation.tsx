"use client";

import { useEffect, useState } from "react";
import {useAffiliateConsent} from "./consent-provider";

const banners = [
  { name: "Reifen.com", s: "3855040", v: "7605", q: "403450" },
  { name: "Reifen.com", s: "3855041", v: "7605", q: "403450" },
  { name: "Samsung Shop DE", s: "3820327", v: "14815", q: "381849" },
  { name: "MacTrade", s: "2481981", v: "13737", q: "372932" },
  { name: "MacTrade", s: "2481968", v: "13737", q: "372932" },
] as const;

export function PartnerBannerRotation() {
  const consent=useAffiliateConsent();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    // Start at a different banner on each page visit, without a hydration mismatch.
    const timer = window.setTimeout(() => setIndex(Math.floor(Math.random() * banners.length)), 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (paused) return;
    const timer = window.setInterval(() => setIndex((current) => (current + 1) % banners.length), 10000);
    return () => window.clearInterval(timer);
  }, [paused]);

  const banner = banners[index];
  const url = `https://www.awin1.com/cread.php?s=${banner.s}&v=${banner.v}&q=${banner.q}&r=3123004&cons=${consent==="accepted"?"1":"0"}`;
  const image = `https://www.awin1.com/cshow.php?s=${banner.s}&v=${banner.v}&q=${banner.q}&r=3123004`;

  return (
    <section className="reifen-ads" aria-label="Werbung unserer Partner"
      onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)} onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false);
      }}>
      <p className="reifen-ads-label">Anzeige · {banner.name}</p>
      <div className="reifen-ads-grid">
        <a href={url} rel="sponsored nofollow noopener noreferrer" target="_blank"
          aria-label={`Werbung von ${banner.name} (öffnet in neuem Tab)`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {consent==="accepted" ? <img src={image} alt={`${banner.name} Werbebanner`} loading="lazy" /> : <span className="partner-banner-text">Externe Awin-Banner erst nach Zustimmung · {banner.name}</span>}
          <span className="partner-banner-text" style={{ display: "block", fontSize: 12, lineHeight: 1.5, padding: "10px 8px", textAlign: "center", color: "#29734f", fontWeight: 700 }}>Angebote bei {banner.name} ansehen ↗</span>
        </a>
      </div>
      <div className="partner-banner-controls" aria-label="Werbebanner wechseln">
        <button type="button" onClick={() => setIndex((current) => (current + banners.length - 1) % banners.length)} aria-label="Vorheriger Werbebanner">‹</button>
        <span>{index + 1} / {banners.length}</span>
        <button type="button" onClick={() => setIndex((current) => (current + 1) % banners.length)} aria-label="Nächster Werbebanner">›</button>
      </div>
    </section>
  );
}
