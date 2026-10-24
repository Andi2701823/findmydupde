"use client";

import { useEffect, useState } from "react";
import { useAffiliateConsent } from "./consent-provider";

const banners = [
  { name: "Reifen.com", s: "3855040", v: "7605", q: "403450" },
  { name: "Samsung Shop DE", s: "3820327", v: "14815", q: "381849" },
  { name: "MacTrade", s: "2481981", v: "13737", q: "372932" },
  { name: "Reifen.com", s: "3855041", v: "7605", q: "403450" },
  { name: "MacTrade", s: "2481968", v: "13737", q: "372932" },
] as const;

const ROTATION_MS = 10000;

export function PartnerBannerRotation() {
  const consent = useAffiliateConsent();
  // Always begin with the same creative. A random initial index caused a
  // different banner to appear immediately after hydration.
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [visible, setVisible] = useState(true);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const updateVisibility = () => setVisible(document.visibilityState === "visible");
    document.addEventListener("visibilitychange", updateVisibility);
    const initialCheck = window.setTimeout(() => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) setPaused(true);
      updateVisibility();
    }, 0);
    return () => {
      window.clearTimeout(initialCheck);
      document.removeEventListener("visibilitychange", updateVisibility);
    };
  }, []);

  useEffect(() => {
    if (paused || !visible) return;
    // Restart the countdown after every manual or automatic change. Do not
    // pause merely because the visitor's pointer or focus remains on an arrow.
    const timer = window.setTimeout(() => setIndex(current => (current + 1) % banners.length), ROTATION_MS);
    return () => window.clearTimeout(timer);
  }, [index, paused, visible]);

  const banner = banners[index];
  const url = `https://www.awin1.com/cread.php?s=${banner.s}&v=${banner.v}&q=${banner.q}&r=3123004&cons=${consent === "accepted" ? "1" : "0"}`;
  const image = `https://www.awin1.com/cshow.php?s=${banner.s}&v=${banner.v}&q=${banner.q}&r=3123004`;
  const showImage = consent === "accepted" && !failedImages[banner.s];

  return (
    <section className="reifen-ads" aria-label="Werbung unserer Partner">
      <p className="reifen-ads-label">Anzeige · {banner.name}</p>
      <div className="reifen-ads-grid">
        <a href={url} rel="sponsored nofollow noopener noreferrer" target="_blank"
          aria-label={`Werbung von ${banner.name} (öffnet in neuem Tab)`}>
          {showImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={banner.s} src={image} alt={`${banner.name} Werbebanner`} loading="lazy"
              onError={() => setFailedImages(current => ({ ...current, [banner.s]: true }))} />
          ) : (
            <span className="partner-banner-text">
              {consent === "accepted" ? `Angebote von ${banner.name}` : `Externe Awin-Banner erst nach Zustimmung · ${banner.name}`}
            </span>
          )}
          <span className="partner-banner-text partner-banner-cta">Angebote bei {banner.name} ansehen ↗</span>
        </a>
      </div>
      <div className="partner-banner-controls" aria-label="Werbebanner wechseln">
        <button type="button" onClick={() => setIndex(current => (current + banners.length - 1) % banners.length)}
          aria-label="Vorheriger Werbebanner">‹</button>
        <span aria-live="off">{index + 1} / {banners.length}</span>
        <button type="button" onClick={() => setIndex(current => (current + 1) % banners.length)}
          aria-label="Nächster Werbebanner">›</button>
        <button type="button" className="partner-banner-pause" onClick={() => setPaused(current => !current)}
          aria-label={paused ? "Bannerrotation fortsetzen" : "Bannerrotation pausieren"}
          aria-pressed={paused} title={paused ? "Rotation fortsetzen" : "Rotation pausieren"}>
          {paused ? "▶" : "Ⅱ"}
        </button>
      </div>
    </section>
  );
}
